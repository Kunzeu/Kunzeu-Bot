const { MongoClient } = require('mongodb');

class DatabaseManager {
    constructor() {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no encontrada en variables de entorno');
        }
        
        this.uri = process.env.MONGODB_URI;
        this.client = new MongoClient(this.uri);
        this.dbName = 'kunzeubot'; // Nombre de tu base de datos
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('✅ Conectado a MongoDB Atlas');
            
            this.db = this.client.db(this.dbName);
            this.apiKeys = this.db.collection('api_keys');
            
            // Crear índice único para user_id si no existe
            await this.apiKeys.createIndex({ user_id: 1 }, { unique: true });
            
            console.log('📁 Base de datos lista:', this.dbName);
            return true;
        } catch (error) {
            console.error('❌ Error de conexión MongoDB:', error);
            return false;
        }
    }

    async setApiKey(userId, apiKey) {
        try {
            const result = await this.apiKeys.updateOne(
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
            console.error('Error guardando API key:', error);
            return false;
        }
    }

    async getApiKey(userId) {
        try {
            const result = await this.apiKeys.findOne({ user_id: userId });
            return result ? result.api_key : null;
        } catch (error) {
            console.error('Error obteniendo API key:', error);
            return null;
        }
    }

    async deleteApiKey(userId) {
        try {
            const result = await this.apiKeys.deleteOne({ user_id: userId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('Error eliminando API key:', error);
            return false;
        }
    }

    async hasApiKey(userId) {
        try {
            const result = await this.apiKeys.findOne({ user_id: userId });
            return !!result;
        } catch (error) {
            console.error('Error verificando API key:', error);
            return false;
        }
    }
}

const dbManager = new DatabaseManager();
module.exports = dbManager; 