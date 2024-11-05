const { MongoClient } = require('mongodb');

class DatabaseManager {
    constructor() {
        this.uri = process.env.MONGODB_URI;
        this.client = new MongoClient(this.uri);
        this.dbName = 'kunzeubot';
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            this.apiKeys = this.db.collection('api_keys');
            
            await this.apiKeys.createIndex({ user_id: 1 }, { unique: true });
            
            console.log(`✅ Connected to MongoDB Database: ${this.dbName}`);
            const dbs = await this.client.db().admin().listDatabases();
            console.log('Available databases:', dbs.databases.map(db => db.name));
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
        }
    }

    async getApiKey(userId) {
        try {
            const result = await this.apiKeys.findOne({ user_id: userId });
            return result ? result.api_key : null;
        } catch (error) {
            console.error('Error getting API key:', error);
            return null;
        }
    }

    async setApiKey(userId, apiKey) {
        try {
            await this.apiKeys.updateOne(
                { user_id: userId },
                { 
                    $set: { 
                        api_key: apiKey,
                        updated_at: new Date()
                    }
                },
                { upsert: true }
            );
            return true;
        } catch (error) {
            console.error('Error setting API key:', error);
            return false;
        }
    }

    async deleteApiKey(userId) {
        try {
            await this.apiKeys.deleteOne({ user_id: userId });
            return true;
        } catch (error) {
            console.error('Error deleting API key:', error);
            return false;
        }
    }

    async hasApiKey(userId) {
        try {
            const result = await this.apiKeys.findOne({ user_id: userId });
            return !!result;
        } catch (error) {
            console.error('Error checking API key:', error);
            return false;
        }
    }

    async close() {
        try {
            await this.client.close();
            console.log('MongoDB connection closed');
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
        }
    }
}

const dbManager = new DatabaseManager();

process.on('SIGINT', async () => {
    await dbManager.close();
    process.exit(0);
});

module.exports = dbManager; 