"""
APEX Super Fast Message Search Engine (Docker-Free)
Uses SQLite FTS for sub-100ms search performance
"""

import sqlite3
import time
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/apex_search.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ApexSearchEngine:
    def __init__(self, db_path: str = "data/apex_search.db"):
        """Initialize the APEX search engine"""
        self.db_path = db_path
        self.conn = None
        self.init_database()
    
    def init_database(self):
        """Initialize SQLite database with FTS support"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        self.conn = sqlite3.connect(self.db_path)
        self.conn.execute("PRAGMA journal_mode=WAL")  # Write-Ahead Logging for performance
        self.conn.execute("PRAGMA synchronous=NORMAL")  # Faster writes
        self.conn.execute("PRAGMA cache_size=10000")   # Larger cache
        self.conn.execute("PRAGMA temp_store=MEMORY")  # Store temp tables in memory
        
        # Create main messages table
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT UNIQUE NOT NULL,
                sender_email TEXT NOT NULL,
                sender_domain TEXT NOT NULL,
                sender_ip TEXT,
                recipient_email TEXT NOT NULL,
                subject TEXT NOT NULL,
                content TEXT NOT NULL,
                timestamp DATETIME NOT NULL,
                threat_category TEXT NOT NULL,
                apex_action TEXT NOT NULL,
                threat_score REAL NOT NULL,
                file_attachments TEXT,
                urls TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Create FTS virtual table for super fast text search
        self.conn.execute("""
            CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
                sender_email,
                sender_domain,
                sender_ip,
                recipient_email,
                subject,
                content,
                threat_category,
                apex_action,
                file_attachments,
                urls,
                content='messages',
                content_rowid='id'
            )
        """)
        
        # Create indexes for ultra-fast lookups
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sender_email ON messages(sender_email)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sender_domain ON messages(sender_domain)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_sender_ip ON messages(sender_ip)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON messages(timestamp)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_threat_category ON messages(threat_category)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_apex_action ON messages(apex_action)")
        self.conn.execute("CREATE INDEX IF NOT EXISTS idx_threat_score ON messages(threat_score)")
        
        self.conn.commit()
        logger.info("APEX Search Engine initialized successfully")
    
    def add_message(self, message_data: Dict[str, Any]) -> bool:
        """Add a message to the search index"""
        try:
            cursor = self.conn.cursor()
            
            # Insert into main table
            cursor.execute("""
                INSERT OR REPLACE INTO messages (
                    message_id, sender_email, sender_domain, sender_ip,
                    recipient_email, subject, content, timestamp,
                    threat_category, apex_action, threat_score,
                    file_attachments, urls
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message_data['message_id'],
                message_data['sender_email'],
                message_data['sender_domain'],
                message_data.get('sender_ip'),
                message_data['recipient_email'],
                message_data['subject'],
                message_data['content'],
                message_data['timestamp'],
                message_data['threat_category'],
                message_data['apex_action'],
                message_data['threat_score'],
                json.dumps(message_data.get('file_attachments', [])),
                json.dumps(message_data.get('urls', []))
            ))
            
            # Insert into FTS table
            cursor.execute("""
                INSERT OR REPLACE INTO messages_fts (
                    sender_email, sender_domain, sender_ip,
                    recipient_email, subject, content,
                    threat_category, apex_action,
                    file_attachments, urls
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                message_data['sender_email'],
                message_data['sender_domain'],
                message_data.get('sender_ip', ''),
                message_data['recipient_email'],
                message_data['subject'],
                message_data['content'],
                message_data['threat_category'],
                message_data['apex_action'],
                json.dumps(message_data.get('file_attachments', [])),
                json.dumps(message_data.get('urls', []))
            ))
            
            self.conn.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error adding message: {str(e)}")
            return False
    
    def search_messages(self, query_params: Dict[str, Any]) -> Dict[str, Any]:
        """Super fast message search with sub-100ms performance"""
        start_time = time.time()
        
        try:
            # Build SQL query based on search parameters
            where_clauses = []
            params = []
            
            # Sender email search
            if 'sender' in query_params:
                where_clauses.append("sender_email LIKE ?")
                params.append(f"%{query_params['sender']}%")
            
            # Domain search
            if 'domain' in query_params:
                where_clauses.append("sender_domain LIKE ?")
                params.append(f"%{query_params['domain']}%")
            
            # IP address search
            if 'ip_address' in query_params:
                where_clauses.append("sender_ip = ?")
                params.append(query_params['ip_address'])
            
            # Subject search (using FTS)
            if 'subject' in query_params:
                where_clauses.append("messages_fts MATCH ?")
                params.append(f"subject:{query_params['subject']}")
            
            # Content search (using FTS)
            if 'content' in query_params:
                where_clauses.append("messages_fts MATCH ?")
                params.append(f"content:{query_params['content']}")
            
            # Date range search
            if 'date_from' in query_params:
                where_clauses.append("timestamp >= ?")
                params.append(query_params['date_from'])
            
            if 'date_to' in query_params:
                where_clauses.append("timestamp <= ?")
                params.append(query_params['date_to'])
            
            # Threat category search
            if 'threat_category' in query_params:
                where_clauses.append("threat_category = ?")
                params.append(query_params['threat_category'])
            
            # APEX action search
            if 'apex_action' in query_params:
                where_clauses.append("apex_action = ?")
                params.append(query_params['apex_action'])
            
            # Build final query
            where_clause = " AND ".join(where_clauses) if where_clauses else "1=1"
            
            # Get total count
            count_query = f"SELECT COUNT(*) FROM messages WHERE {where_clause}"
            cursor = self.conn.cursor()
            cursor.execute(count_query, params)
            total_hits = cursor.fetchone()[0]
            
            # Get paginated results
            limit = query_params.get('size', 50)
            offset = query_params.get('from', 0)
            
            search_query = f"""
                SELECT * FROM messages 
                WHERE {where_clause}
                ORDER BY timestamp DESC, threat_score DESC
                LIMIT ? OFFSET ?
            """
            
            cursor.execute(search_query, params + [limit, offset])
            rows = cursor.fetchall()
            
            # Convert rows to dictionaries
            columns = [description[0] for description in cursor.description]
            messages = [dict(zip(columns, row)) for row in rows]
            
            # Get facets/aggregations
            facets = self._get_facets(where_clause, params)
            
            end_time = time.time()
            query_time_ms = (end_time - start_time) * 1000
            
            return {
                'query_time_ms': round(query_time_ms, 2),
                'total_hits': total_hits,
                'messages': messages,
                'facets': facets
            }
            
        except Exception as e:
            logger.error(f"Search error: {str(e)}")
            return {'error': str(e)}
    
    def _get_facets(self, where_clause: str, params: List[Any]) -> Dict[str, List[Dict]]:
        """Get aggregation facets for search results"""
        facets = {}
        
        try:
            cursor = self.conn.cursor()
            
            # Threat categories
            cursor.execute(f"""
                SELECT threat_category, COUNT(*) as count 
                FROM messages 
                WHERE {where_clause}
                GROUP BY threat_category 
                ORDER BY count DESC
            """, params)
            facets['threat_categories'] = [
                {'name': row[0], 'count': row[1]} 
                for row in cursor.fetchall()
            ]
            
            # APEX actions
            cursor.execute(f"""
                SELECT apex_action, COUNT(*) as count 
                FROM messages 
                WHERE {where_clause}
                GROUP BY apex_action 
                ORDER BY count DESC
            """, params)
            facets['apex_actions'] = [
                {'name': row[0], 'count': row[1]} 
                for row in cursor.fetchall()
            ]
            
            # Sender domains
            cursor.execute(f"""
                SELECT sender_domain, COUNT(*) as count 
                FROM messages 
                WHERE {where_clause}
                GROUP BY sender_domain 
                ORDER BY count DESC
                LIMIT 10
            """, params)
            facets['sender_domains'] = [
                {'name': row[0], 'count': row[1]} 
                for row in cursor.fetchall()
            ]
            
        except Exception as e:
            logger.error(f"Error getting facets: {str(e)}")
        
        return facets
    
    def get_stats(self) -> Dict[str, Any]:
        """Get search engine statistics"""
        try:
            cursor = self.conn.cursor()
            
            # Total messages
            cursor.execute("SELECT COUNT(*) FROM messages")
            total_messages = cursor.fetchone()[0]
            
            # Messages by threat category
            cursor.execute("""
                SELECT threat_category, COUNT(*) 
                FROM messages 
                GROUP BY threat_category
            """)
            threat_stats = dict(cursor.fetchall())
            
            # Messages by APEX action
            cursor.execute("""
                SELECT apex_action, COUNT(*) 
                FROM messages 
                GROUP BY apex_action
            """)
            action_stats = dict(cursor.fetchall())
            
            # Recent activity (last 24 hours)
            yesterday = datetime.now() - timedelta(days=1)
            cursor.execute("""
                SELECT COUNT(*) FROM messages 
                WHERE timestamp >= ?
            """, (yesterday.isoformat(),))
            recent_messages = cursor.fetchone()[0]
            
            return {
                'total_messages': total_messages,
                'threat_categories': threat_stats,
                'apex_actions': action_stats,
                'recent_messages_24h': recent_messages,
                'database_size_mb': os.path.getsize(self.db_path) / (1024 * 1024)
            }
            
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            return {'error': str(e)}
    
    def add_sample_data(self):
        """Add sample data for testing"""
        sample_messages = [
            {
                'message_id': 'msg_001',
                'sender_email': 'phisher@malicious-domain.com',
                'sender_domain': 'malicious-domain.com',
                'sender_ip': '192.168.1.100',
                'recipient_email': 'user@company.com',
                'subject': 'Urgent: Verify Your Account',
                'content': 'Click here to verify your account immediately',
                'timestamp': datetime.utcnow().isoformat(),
                'threat_category': 'phishing',
                'apex_action': 'quarantine',
                'threat_score': 0.95,
                'file_attachments': ['malware.exe'],
                'urls': ['http://fake-bank.com/login']
            },
            {
                'message_id': 'msg_002',
                'sender_email': 'legitimate@sender.com',
                'sender_domain': 'sender.com',
                'sender_ip': '10.0.0.1',
                'recipient_email': 'user@company.com',
                'subject': 'Monthly Report',
                'content': 'Please find attached the monthly report',
                'timestamp': (datetime.utcnow() - timedelta(days=1)).isoformat(),
                'threat_category': 'legitimate',
                'apex_action': 'deliver',
                'threat_score': 0.05,
                'file_attachments': ['report.pdf'],
                'urls': []
            },
            {
                'message_id': 'msg_003',
                'sender_email': 'spammer@fake-news.com',
                'sender_domain': 'fake-news.com',
                'sender_ip': '172.16.0.50',
                'recipient_email': 'user@company.com',
                'subject': 'Breaking News: You Won $1 Million!',
                'content': 'Congratulations! You have won $1 million dollars',
                'timestamp': (datetime.utcnow() - timedelta(hours=6)).isoformat(),
                'threat_category': 'spam',
                'apex_action': 'quarantine',
                'threat_score': 0.85,
                'file_attachments': [],
                'urls': ['http://fake-lottery.com/claim']
            }
        ]
        
        for message in sample_messages:
            self.add_message(message)
        
        logger.info(f"Added {len(sample_messages)} sample messages")
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

# Global search engine instance
search_engine = ApexSearchEngine()
