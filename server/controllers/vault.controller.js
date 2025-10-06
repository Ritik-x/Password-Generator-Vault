import Vault from "../models/vault.model.js";

export const createVault = async (req, res) => {
  try {
    const { title, username, password, url, notes } = req.body;
    const vault = await Vault.create({
      title,
      username,
      password,
      url,
      notes,
      user: req.user._id,
    });
    res.status(201).json(vault); // send created item back
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getVault = async (req, res) => {
  try {
    const items = await Vault.find({ user: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

export const updateItem = async (req, res) => {
  try {
    const item = await VaultItem.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const item = await VaultItem.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
