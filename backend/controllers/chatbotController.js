const Chatbot  = require('../models/Chatbot');
const Document = require('../models/Document');
const { deleteNamespace } = require('../services/embeddingService');

exports.create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const chatbot = await Chatbot.create({ owner: req.user._id, name, description });
    res.status(201).json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const chatbots = await Chatbot.find({ owner: req.user._id, isArchived: false })
      .populate('documents', 'name status type stats')
      .sort('-createdAt');
    res.json({ success: true, chatbots });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, owner: req.user._id })
      .populate('documents');
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { name, description, settings, widget, allowedDomains } = req.body;
    const chatbot = await Chatbot.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { $set: { name, description, settings, widget, allowedDomains } },
      { new: true, runValidators: true }
    );
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ _id: req.params.id, owner: req.user._id });
    if (!chatbot) return res.status(404).json({ success: false, message: 'Chatbot not found' });

    // Delete all Pinecone vectors for this chatbot
    await deleteNamespace(chatbot.vectorNamespace);

    // Delete all documents
    await Document.deleteMany({ chatbot: chatbot._id });

    await chatbot.deleteOne();
    res.json({ success: true, message: 'Chatbot deleted' });
  } catch (err) { next(err); }
};

// Public endpoint - get chatbot config for embed widget
exports.getPublicConfig = async (req, res, next) => {
  try {
    const chatbot = await Chatbot.findOne({ embedId: req.params.embedId, isPublic: true, status: 'ready' })
      .select('widget settings.fallbackMessage settings.language name');
    if (!chatbot) return res.status(404).json({ success: false, message: 'Bot not found' });
    res.json({ success: true, chatbot });
  } catch (err) { next(err); }
};
