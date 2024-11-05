const { MongoClient } = require('mongodb');

class DatabaseManager {
    constructor() {
        try {
            if (!process.env.MONGODB_URI) {
                console.error('❌ MONGODB_URI no encontrada en variables de entorno');
                return;
            }
            
            this.uri = process.env.MONGODB_URI;
            this.client = new MongoClient(this.uri);
            this.dbName = 'kunzeubot';
            
            // Conectar inmediatamente
            this.init();
            
        } catch (error) {
            console.error('❌ Error en constructor de DatabaseManager:', error);
        }
    }

    async init() {
        try {
            await this.client.connect();
            console.log('✅ Conectado a MongoDB');
            
            this.db = this.client.db(this.dbName);
            this.apiKeys = this.db.collection('api_keys');
            
            // Verificar la conexión
            await this.db.command({ ping: 1 });
            console.log('🟢 Base de datos respondiendo');
            
            return true;
        } catch (error) {
            console.error('❌ Error de conexión MongoDB:', error);
            return false;
        }
    }

    async setApiKey(userId, apiKey) {
        try {
            if (!this.db || !this.apiKeys) {
                await this.init();
            }
            
            const result = await this.apiKeys.updateOne(
                { user_id: userId },
                { $set: { api_key: apiKey } },
                { upsert: true }
            );
            
            console.log(`📝 API Key guardada para usuario ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Error guardando API key:', error);
            return false;
        }
    }

    async getApiKey(userId) {
        try {
            if (!this.db || !this.apiKeys) {
                await this.init();
            }
            
            const result = await this.apiKeys.findOne({ user_id: userId });
            return result ? result.api_key : null;
        } catch (error) {
            console.error('❌ Error obteniendo API key:', error);
            return null;
        }
    }

    async deleteApiKey(userId) {
        try {
            if (!this.db || !this.apiKeys) {
                await this.init();
            }
            
            const result = await this.apiKeys.deleteOne({ user_id: userId });
            return result.deletedCount > 0;
        } catch (error) {
            console.error('❌ Error eliminando API key:', error);
            return false;
        }
    }

    async hasApiKey(userId) {
        try {
            if (!this.db || !this.apiKeys) {
                await this.init();
            }
            
            const result = await this.apiKeys.findOne({ user_id: userId });
            return !!result;
        } catch (error) {
            console.error('❌ Error verificando API key:', error);
            return false;
        }
    }
}

// Crear una única instancia
const dbManager = new DatabaseManager();

// Exportar la instancia
module.exports = dbManager; 