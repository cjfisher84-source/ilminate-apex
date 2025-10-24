"""
APEX Super Fast Message Search API (Docker-Free)
Lightweight Flask API with SQLite FTS backend
"""

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os
import logging
from search_engine import search_engine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/apex_search_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    """Main search interface"""
    return render_template('search.html')

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        stats = search_engine.get_stats()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'total_messages': stats.get('total_messages', 0),
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500

@app.route('/search', methods=['POST'])
def search_messages():
    """
    Super fast message search endpoint
    Supports search by sender, domain, IP, subject, content, date range
    """
    try:
        data = request.get_json() or {}
        
        # Execute search
        results = search_engine.search_messages(data)
        
        logger.info(f"Search completed in {results.get('query_time_ms', 0):.2f}ms")
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/search/quick', methods=['GET'])
def quick_search():
    """Quick search endpoint for simple queries"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Query parameter required'}), 400
        
        # Build search parameters
        search_params = {}
        
        # Try to detect search type
        if '@' in query:
            search_params['sender'] = query
        elif '.' in query and ' ' not in query:
            search_params['domain'] = query
        elif query.replace('.', '').replace(':', '').isdigit():
            search_params['ip_address'] = query
        else:
            search_params['subject'] = query
        
        results = search_engine.search_messages(search_params)
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Quick search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Get search engine statistics"""
    try:
        stats = search_engine.get_stats()
        return jsonify(stats)
    except Exception as e:
        logger.error(f"Stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/messages', methods=['POST'])
def add_message():
    """Add a message to the search index"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['message_id', 'sender_email', 'sender_domain', 
                          'recipient_email', 'subject', 'content', 
                          'threat_category', 'apex_action', 'threat_score']
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Add timestamp if not provided
        if 'timestamp' not in data:
            data['timestamp'] = datetime.utcnow().isoformat()
        
        success = search_engine.add_message(data)
        
        if success:
            return jsonify({'status': 'success', 'message': 'Message added successfully'})
        else:
            return jsonify({'error': 'Failed to add message'}), 500
            
    except Exception as e:
        logger.error(f"Add message error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/setup', methods=['POST'])
def setup_sample_data():
    """Setup sample data for testing"""
    try:
        search_engine.add_sample_data()
        return jsonify({
            'status': 'success',
            'message': 'Sample data added successfully'
        })
    except Exception as e:
        logger.error(f"Setup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/search/advanced', methods=['POST'])
def advanced_search():
    """Advanced search with multiple criteria"""
    try:
        data = request.get_json() or {}
        
        # Build advanced query
        search_params = {}
        
        # Text search
        if 'text' in data:
            search_params['subject'] = data['text']
        
        # Sender filters
        if 'sender_email' in data:
            search_params['sender'] = data['sender_email']
        
        if 'sender_domain' in data:
            search_params['domain'] = data['sender_domain']
        
        if 'sender_ip' in data:
            search_params['ip_address'] = data['sender_ip']
        
        # Threat filters
        if 'threat_category' in data:
            search_params['threat_category'] = data['threat_category']
        
        if 'apex_action' in data:
            search_params['apex_action'] = data['apex_action']
        
        # Date range
        if 'date_from' in data:
            search_params['date_from'] = data['date_from']
        
        if 'date_to' in data:
            search_params['date_to'] = data['date_to']
        
        # Pagination
        if 'size' in data:
            search_params['size'] = data['size']
        
        if 'from' in data:
            search_params['from'] = data['from']
        
        results = search_engine.search_messages(search_params)
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Advanced search error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    logger.info("Starting APEX Search API (Docker-Free)...")
    
    # Add sample data on first run
    try:
        stats = search_engine.get_stats()
        if stats.get('total_messages', 0) == 0:
            logger.info("Adding sample data...")
            search_engine.add_sample_data()
    except Exception as e:
        logger.error(f"Error setting up sample data: {str(e)}")
    
    # Start the API
    app.run(host='0.0.0.0', port=5000, debug=False)
