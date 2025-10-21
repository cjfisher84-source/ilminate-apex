/**
 * ⚠️  STAGING ONLY - DO NOT RUN WITHOUT EXPLICIT APPROVAL ⚠️
 * 
 * This script backfills ATT&CK technique mappings for existing events.
 * It writes a "techniques" attribute to each event in the staging table.
 * 
 * Prerequisites:
 * - AWS credentials configured
 * - TABLE env var set to staging table
 * - MAPPER_PROXY env var set to staging API endpoint
 * - Explicit approval and backup/snapshot taken
 * 
 * Usage:
 *   TABLE=ILMINATE_EVENTS_STAGING \
 *   MAPPER_PROXY="https://staging.apex.ilminate.com/api/attack/map" \
 *   ts-node scripts/backfill_attack_mapping.ts
 */

import { DynamoDBClient, QueryCommand, UpdateItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';

const TABLE = process.env.TABLE || 'ILMINATE_EVENTS_STAGING';
const API = process.env.MAPPER_PROXY || 'http://localhost:3000/api/attack/map';
const ddb = new DynamoDBClient({});

async function* eventsLast30d() {
  // TODO: Replace with your real query (GSI or time partition)
  // This is a simple Scan for MVP - NOT recommended for production scale
  console.log(`⚠️  Scanning table: ${TABLE} (first 1000 items for safety)`);
  
  const resp = await ddb.send(new ScanCommand({ 
    TableName: TABLE, 
    Limit: 1000 
  }));
  
  for (const item of resp.Items || []) {
    yield item;
  }
}

async function run() {
  console.log('🚀 Starting ATT&CK mapping backfill...');
  console.log(`📊 Table: ${TABLE}`);
  console.log(`🔗 Mapper API: ${API}`);
  console.log('');

  let count = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for await (const item of eventsLast30d()) {
    count++;
    
    const event_id = item.event_id?.S || item.id?.S;
    if (!event_id) {
      skipped++;
      continue;
    }

    // Extract text from various possible fields
    const text = item.summary?.S || item.cmdline?.S || item.subject?.S || item.body?.S || '';
    
    if (!text) {
      skipped++;
      continue;
    }

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id, text })
      });

      if (!response.ok) {
        console.error(`❌ API error for ${event_id}: ${response.status}`);
        errors++;
        continue;
      }

      const data = await response.json();
      
      if (!data.ok) {
        console.error(`❌ Mapper error for ${event_id}:`, data.error);
        errors++;
        continue;
      }

      // Only update if techniques were found
      if (data.techniques && data.techniques.length > 0) {
        await ddb.send(new UpdateItemCommand({
          TableName: TABLE,
          Key: { event_id: { S: event_id } },
          UpdateExpression: 'SET techniques = :t, techniques_updated_at = :ts',
          ExpressionAttributeValues: {
            ':t': { S: JSON.stringify(data.techniques) },
            ':ts': { S: new Date().toISOString() }
          }
        }));
        
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`✅ Updated ${updated} events (${count} processed, ${skipped} skipped, ${errors} errors)...`);
        }
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${event_id}:`, error);
      errors++;
    }

    // Rate limiting to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('✅ Backfill complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Total processed: ${count}`);
  console.log(`   - Updated with techniques: ${updated}`);
  console.log(`   - Skipped (no text/no techniques): ${skipped}`);
  console.log(`   - Errors: ${errors}`);
}

// Safety check
if (!process.env.TABLE || !process.env.MAPPER_PROXY) {
  console.error('❌ ERROR: TABLE and MAPPER_PROXY environment variables are required');
  console.error('');
  console.error('Usage:');
  console.error('  TABLE=ILMINATE_EVENTS_STAGING \\');
  console.error('  MAPPER_PROXY="https://staging.apex.ilminate.com/api/attack/map" \\');
  console.error('  ts-node scripts/backfill_attack_mapping.ts');
  process.exit(1);
}

if (TABLE.toLowerCase().includes('prod')) {
  console.error('❌ ERROR: TABLE name contains "prod" - this script is for staging only!');
  process.exit(1);
}

run().catch(e => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});

