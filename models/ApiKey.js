const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
    api_key: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Añadir logs al modelo
apiKeySchema.pre('save', function(next) {
    console.log('🔄 Guardando API key para usuario:', this.user_id);
    next();
});

const ApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);
module.exports = ApiKey; 