const Product = require('../models/products');
const Boom = require('@hapi/boom');

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    throw Boom.internal('Error creating product');
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    throw Boom.internal('Error fetching products');
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      throw Boom.notFound('Product not found');
    }
    res.json(product);
  } catch (error) {
    throw Boom.internal('Error fetching product');
  }
};

const updateProduct = async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id }
    });
    
    if (!updated) {
      throw Boom.notFound('Product not found');
    }
    
    const updatedProduct = await Product.findByPk(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    throw Boom.internal('Error updating product');
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });
    
    if (!deleted) {
      throw Boom.notFound('Product not found');
    }
    
    res.status(204).send();
  } catch (error) {
    throw Boom.internal('Error deleting product');
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
