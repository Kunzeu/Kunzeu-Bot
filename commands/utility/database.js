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
            console.log('✅ Connected to MongoDB');
            
            this.db = this.client.db(this.dbName);
            console.log(`📁 Using database: ${this.dbName}`);
            
            // Crear colección si no existe
            const collections = await this.db.listCollections().toArray();
            if (!collections.some(c => c.name === 'api_keys')) {
                await this.db.createCollection('api_keys');
                console.log('📑 Created api_keys collection');
            }
            
            this.apiKeys = this.db.collection('api_keys');
            
            // Crear índice único para user_id
            await this.apiKeys.createIndex({ user_id: 1 }, { unique: true });
            console.log('🔑 Created index on user_id');

            // Verificar la conexión
            const stats = await this.db.stats();
            console.log(`📊 Database stats:
                Collections: ${stats.collections}
                Documents: ${stats.objects}
            `);

            return true;
        } catch (error) {
            console.error('❌ MongoDB connection error:', error);
            return false;
        }
    }

    async getApiKey(userId) {
        try {
            console.log(`Método getApiKey llamado con userId:`, userId);
            const result = await this.apiKeys.findOne({ user_id: userId });
            console.log(`Método getApiKey completado`);
            return result ? result.api_key : null;
        } catch (error) {
            console.error('Error getting API key:', error);
            return null;
        }
    }

    async setApiKey(userId, apiKey) {
        try {
            console.log(`Método setApiKey llamado con userId:`, userId);
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
            console.log(`Método setApiKey completado`);
            return true;
        } catch (error) {
            console.error('Error setting API key:', error);
            return false;
        }
    }

    async deleteApiKey(userId) {
        try {
            console.log(`Método deleteApiKey llamado con userId:`, userId);
            await this.apiKeys.deleteOne({ user_id: userId });
            console.log(`Método deleteApiKey completado`);
            return true;
        } catch (error) {
            console.error('Error deleting API key:', error);
            return false;
        }
    }

    async hasApiKey(userId) {
        try {
            console.log(`Método hasApiKey llamado con userId:`, userId);
            const result = await this.apiKeys.findOne({ user_id: userId });
            console.log(`Método hasApiKey completado`);
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