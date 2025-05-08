const { createSlug } = require("../utils/hook");
const { Op, where } = require("sequelize");
const _ = require("lodash");
const sequelize = require("../config/database");
const boom = require("@hapi/boom");
const { message } = require("../utils/hook");
const { Product, PRODUCT_STATUS } = require("../models/products/index");
const Catalog = require("../models/catalog");
const Category = require("../models/category");
const Website = require("../models/website");
const SubCategory = require("../models/subCategory");
const User = require("../models/users");
const ProductAttribute = require("../models/products/product_attribute");
const ProductPricing = require("../models/products/pricing");
const Attribute = require("../models/products/attributes");
const ProductCodes = require("../models/products/codes");
const ProductTags = require("../models/products/tags")
const Brand = require("../models/products/brand");
const VehicleType = require("../models/products/vehicleType");

// Common error handler
const handleError = (error, next) => {
  if (error.name === "SequelizeValidationError") {
    next(boom.badRequest(error.message));
  } else if (error.name === "SequelizeUniqueConstraintError") {
    next(boom.conflict("Resource already exists"));
  } else {
    next(boom.internal("Internal server error", error));
  }
};

// Common product finder
const findProduct = async (id) => {
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Catalog,
        as: "catalog",
        attributes: ["id", "name"],
      },
    ],
  });
  if (!product) {
    throw boom.notFound("Product not found");
  }
  return product;
};

const create = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const payloadData =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;

    const payload = {
      ...payloadData,
      catalogId: payloadData.catalogId || null,
      catId: payloadData.catId || null,
      subCategoryId: payloadData.subCategoryId || null,
      websiteId: payloadData.websiteId || null,
    };

    payload.userId = req.user.id;
    if (req.files?.length > 0) {
      payload.images = req.files.map((file) => file.path);
    }
    let where = {};
    const slug = createSlug(payload.name);
    where["slug"] = slug;

    if (payloadData?.catalogId) {
      where["catalogId"] = payloadData.catalogId;
    }
    if (payloadData?.catId) {
      where["catId"] = payloadData.catId;
    }
    if (payloadData?.subCategoryId) {
      where["subCategoryId"] = payloadData.subCategoryId;
    }
    if (payloadData?.websiteId) {
      where["websiteId"] = payloadData.websiteId;
    }
    if (payload?.sku) {
      where["websiteId"] = payloadData.websiteId;
    }

    const existingProduct = await Product.findOne({
      paranoid: false,
      where: where,
    });

    let product;
    if (existingProduct?.deletedAt) {
      await existingProduct.restore({ transaction });

      product = await existingProduct.update(payload, { transaction });
    } else if (existingProduct) {
      throw boom.conflict("Product already exists with this name");
    } else {
      product = await Product.create(payload, { transaction });
    }
    const attributes = payload.attributes || [],
      pricing = payload.pricing || [];

    // Create product attributes
    if (attributes?.length > 0) {
      await ProductAttribute.bulkCreate(
        attributes.map((attr) => ({
          productId: product.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
        { transaction }
      );
    }

    // Create product pricing
    if (pricing?.length > 0) {
      await ProductPricing.bulkCreate(
        pricing.map((price) => ({
          productId: product.id,
          currency: price.currency,
          discountType: price.discountType || "",
          discountValue: price.discountValue || 0,
          basePrice: price.basePrice,
        })),
        { transaction }
      );
    }

    // Fetch the complete product with associations
    const completeProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: ProductAttribute,
          as: "productAttributes",
          include: ["attribute"],
        },
        { model: ProductPricing, as: "productPricing" },
      ],
      transaction,
    });

    await transaction.commit();
    return res
      .status(201)
      .json(message(true, "Product created successfully", completeProduct));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const copyProduct = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    // Find the source product with all its associations
    const sourceProduct = await Product.findByPk(id, {
      include: [
        {
          model: ProductAttribute,
          as: "productAttributes",
        },
        {
          model: ProductPricing,
          as: "productPricing",
        },
      ],
    });

    if (!sourceProduct) {
      throw boom.notFound("Source product not found");
    }

    // Create new product data
    const productData = {
      ...sourceProduct.get(),
      name: `Copy of ${sourceProduct.name}`,
      sku: `Copy of ${sourceProduct.sku}`,
      slug: `${createSlug(sourceProduct.name)}-copy-${Date.now()}`,
      userId: req.user.id,
    };

    // Remove fields that shouldn't be copied
    delete productData.id;
    delete productData.createdAt;
    delete productData.updatedAt;
    delete productData.deletedAt;
    delete productData.productAttributes;
    delete productData.productPricing;

    // Create the new product
    const newProduct = await Product.create(productData, { transaction });

    // Copy attributes
    if (sourceProduct.productAttributes?.length > 0) {
      await ProductAttribute.bulkCreate(
        sourceProduct.productAttributes.map((attr) => ({
          productId: newProduct.id,
          attributeId: attr.attributeId,
          value: attr.value,
        })),
        { transaction }
      );
    }

    // Copy pricing
    if (sourceProduct.productPricing?.length > 0) {
      await ProductPricing.bulkCreate(
        sourceProduct.productPricing.map((price) => ({
          productId: newProduct.id,
          currency: price.currency,
          discountType: price.discountType,
          discountValue: price.discountValue,
          basePrice: price.basePrice,
        })),
        { transaction }
      );
    }

    // Fetch the complete new product with associations
    const completeProduct = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: ProductAttribute,
          as: "productAttributes",
          include: ["attribute"],
        },
        { model: ProductPricing, as: "productPricing" },
      ],
      transaction,
    });

    await transaction.commit();
    return res
      .status(201)
      .json(message(true, "Product copied successfully", completeProduct));
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getSoftDeleted = async (req, res, next) => {
  try {
    const { offset = 0, pageSize = 10 } = req.query;

    const { count, rows } = await Product.findAndCountAll({
      paranoid: false,
      where: {
        deletedAt: { [Op.ne]: null },
      },
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      order: [["deletedAt", "DESC"]],
    });

    return res
      .status(200)
      .json(
        message(true, "Deleted products retrieved successfully", rows, count)
      );
  } catch (error) {
    next(error);
  }
};

const restoreProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the soft-deleted product
    const product = await Product.findOne({
      paranoid: false,
      where: {
        id,
        deletedAt: { [Op.ne]: null },
      },
    });

    if (!product) {
      throw boom.notFound("Deleted product not found");
    }

    // Restore the product
    await product.restore();

    return res
      .status(200)
      .json(message(true, "Product restored successfully", product));
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const {
      catalogId,
      categoryId,
      subCategoryId,
      websiteId,
      offset = 0,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    // Build where clause dynamically
    const where = _.pickBy(
      {
        catalogId,
        categoryId,
        subCategoryId,
        websiteId,
      },
      _.identity
    );

    // Validate sort parameters
    const validSortColumns = ["createdAt", "name"];
    const validSortOrders = ["ASC", "DESC"];
    const order = [
      [
        validSortColumns.includes(sortBy) ? sortBy : "createdAt",
        validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : "DESC",
      ],
    ];

    // Get products with pagination
    const { count, rows } = await Product.findAndCountAll({
      where,
      pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json(message(true, "Products retrieved successfully", rows, count));
  } catch (error) {
    next(error);
  }
};

const getOne = async (req, res, next) => {
  try {

    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: [
            "currency",
            "discountType",
            "discountValue",
            "basePrice",
          ],
        },
        {
          model: ProductAttribute,
          as: "productAttributes",
          attributes: ["attributeId", "value"],
        },
      ],
    });

    if (!product) {
      throw boom.notFound("Product not found");
    }

    return res
      .status(200)
      .json(message(true, "Product retrieved successfully", product));
  } catch (error) {
    next(error);
  }
};

const updateOne = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const rawData =
      typeof req.body.data === "string"
        ? JSON.parse(req.body.data)
        : req.body.data;

    const payload = { ...rawData };

    const existingProduct = await Product.findByPk(id);
    if (!existingProduct) {
      throw boom.notFound("Product not found");
    }

    const where = { slug: createSlug(payload.name) };
    if (payload.catalogId) where.catalogId = payload.catalogId;
    if (payload.catId) where.catId = payload.catId;
    if (payload.subCategoryId) where.subCategoryId = payload.subCategoryId;
    if (payload.websiteId) where.websiteId = payload.websiteId;
    if (payload.sku) where.sku = payload.sku;

    const conflict = await Product.findOne({
      where: {
        ...where,
        id: { [Op.ne]: id },
      },
    });
    
    if (conflict) {
      throw boom.conflict(
        "Another product with this name (or SKU) already exists"
      );
    }

    if (req.files?.length > 0) {
      const newImages = req.files.map(f => f.path);
      payload.images = [...payload.images, ...newImages];
    }

    

    // 5) Update the product row
    await existingProduct.update(payload, { transaction });

    // 6) Replace attributes if provided
    if (Array.isArray(payload.attributes)) {
      await ProductAttribute.destroy({ where: { productId: id }, transaction });
      if (payload.attributes.length) {
        await ProductAttribute.bulkCreate(
          payload.attributes.map((a) => ({
            productId: id,
            attributeId: a.attributeId,
            value: a.value,
          })),
          { transaction }
        );
      }
    }

    // 7) Replace pricing if provided
    if (Array.isArray(payload.pricing)) {
      await ProductPricing.destroy({ where: { productId: id }, transaction });
      if (payload.pricing.length) {
        await ProductPricing.bulkCreate(
          payload.pricing.map((p) => ({
            productId: id,
            currency: p.currency,
            basePrice: p.basePrice,
            discountType: p.discountType || "",
            discountValue: p.discountValue || 0,
          })),
          { transaction }
        );
      }
    }

    // 8) Return the full updated product
    const updated = await Product.findByPk(id, {
      include: [
        {
          model: ProductAttribute,
          as: "productAttributes",
          include: ["attribute"],
        },
        { model: ProductPricing, as: "productPricing" },
      ],
      transaction,
    });

    await transaction.commit();
    return res.json(message(true, "Product updated successfully", updated));
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    const product = await findProduct(req.params.id);
    await product.destroy();
    return res.status(200).json(message(true, "Product deleted successfully"));
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    // Input validation
    if (!req.params.id) {
      throw boom.badRequest("Product ID is required");
    }

    if (!req.body.status) {
      throw boom.badRequest("Status is required");
    }

    const { status } = req.body;
    const productId = req.params.id;

    // Find product first
    const product = await findProduct(productId);

    // Validate status value against enum
    if (!Object.values(PRODUCT_STATUS).includes(status)) {
      throw boom.badRequest(
        `Invalid status. Must be one of: ${Object.values(PRODUCT_STATUS).join(
          ", "
        )}`
      );
    }

    // Update product status
    const updatedProduct = await product.update({ status });

    // Send response
    return res
      .status(200)
      .json(
        message(
          true,
          `Product status updated to ${status} successfully`,
          updatedProduct
        )
      );
  } catch (error) {
    // Pass error to error handler middleware
    next(error);
  }
};

const productDropdown = async (req, res, next) => {
  try {
    const { currency } = req.query;



    const products = await Product.findAll({
      attributes: [
      ["id", "value"],
      [sequelize.literal("CONCAT(sku, ' - ', name)"), "label"],
      ],
      include: [
      {
        model: ProductPricing,
        as: "productPricing",
        attributes: [], 
        where: { currency: currency },
        required: true,
      },
      ],
      order: [["name", "ASC"]]
    });

    return res
      .status(200)
      .json(message(true, "Dropdown retrieved successfully", products));
  } catch (error) {
    next(error);
  }
};

const assignTag = async (req, res, next) => {
  try {
    const { tag: newTags, productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) throw boom.notFound("Product not found");

    // Ensure newTags is an array
    const tagsToAdd = Array.isArray(newTags) ? newTags : [newTags];
    if (tagsToAdd.length === 0) {
      throw boom.badRequest("No tags provided");
    }

    const tags = await ProductTags.findAll({
      where: {
        slug: { [Op.in]: tagsToAdd }
      }
    });
    if(tags.length !== tagsToAdd.length) throw boom.badRequest("Some tags are invalid")

    // Get current tags and filter out duplicates
    // const currentTags = product.tags || [];
    // const uniqueNewTags = tagsToAdd.filter((tag) => !currentTags.includes(tag));

    // if (uniqueNewTags.length === 0) {
    //   throw boom.conflict("All tags already exist on the product");
    // }

    // // Merge and update
    // const updatedTags = [...currentTags, ...uniqueNewTags];
    await product.update({ tags: tagsToAdd });

    return res
      .status(200)
      .json(message(true, "Product tags updated successfully", product));
  } catch (error) {
    next(error);
  }
};

const removeTag = async (req, res, next) => {
  try {
    const { tag: tagsToRemove, productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) throw boom.notFound("Product not found");

    // Validate tags format
    const tags = Array.isArray(tagsToRemove)
      ? tagsToRemove
      : [tagsToRemove].filter(Boolean);

    if (tags.length === 0) {
      throw boom.badRequest("No tags provided");
    }

    // Validate tag values
    // const invalidTags = tags.filter(tag => !Object.values(TAGS).includes(tag));
    // if (invalidTags.length > 0) {
    //   throw boom.badRequest(
    //     `Invalid tags: ${invalidTags.join(', ')}. Valid tags: ${Object.values(TAGS).join(', ')}`
    //   );
    // }

    // Check existing tags
    const currentTags = product.tags || [];

    const missingTags = tags.filter((tag) => !currentTags.includes(tag));
    if (missingTags.length > 0) {
      throw boom.conflict(`Tags not found: ${missingTags.join(", ")}`);
    }

    // Remove tags
    const updatedTags = currentTags.filter((t) => !tags.includes(t));
    await product.update({ tags: updatedTags });

    return res
      .status(200)
      .json(message(true, "Tags removed successfully", product));
  } catch (error) {
    next(error);
  }
};

const attributeList = async (req, res, next) => {
  try {
    const { attributeName } = req.query;
    if (!attributeName)
      throw boom.badRequest("Attribute is require to access this endpoint");
      if(attributeName === 'brand') {
        const results = await Brand.findAll({
          attributes: [
            ["id", "value"],
            "name",
            "productCount",
            "slug"
          ],
          order: [["name", "ASC"]],
        });
        res
        .status(200)
        .json(message(true, "Attribute retrieved successfully", results)); 
      }
      else if(attributeName === 'vehicle_type') {
        const results = await VehicleType.findAll({
          attributes: [
            ["id", "value"],
            "name",
            "productCount",
            "slug"
          ],
          order: [["name", "ASC"]],
        });
        res
        .status(200)
        .json(message(true, "Attribute retrieved successfully", results)); 

      }
      else{
        res.status(400).json(message(false, "Invalid attribute name"));
      }

  } catch (error) {
    next(error);
  }
};

const productList = async (req, res, next) => {
  try {
    const { websiteId, offset = 0, pageSize = 20 } = req.query;
    const { catalog, categories, subcategories, brands, vehicle_type, tag } =
      req.body;

    const currency = req?.meta?.currency;
    
    const filterConditions = [];

    // Categories filter
    if (categories?.length > 0) {
      const categoryIds = await Category.findAll({
        where: { slug: { [Op.in]: categories } },
        attributes: ["id"],
      }).then((cats) => cats.map((cat) => cat.id));
      filterConditions.push({ catId: { [Op.in]: categoryIds } });
    }

    // Subcategories filter
    if (subcategories?.length > 0) {
      const subCategoryIds = await SubCategory.findAll({
        where: { slug: { [Op.in]: subcategories } },
        attributes: ["id"],
      }).then((subs) => subs.map((sub) => sub.id));
      filterConditions.push({ subCategoryId: { [Op.in]: subCategoryIds } });
    }

    // Catalog filter (catalog is a string, not an array)
    if (catalog) {
      const catalogData = await Catalog.findOne({
        where: { slug: catalog },
        attributes: ["id"],
      });
      if (catalogData) {
        filterConditions.push({ catalogId: catalogData.id });
      }
    }

    // Prepare attribute filtering
    if (brands?.length > 0) {
      const brandIds = await Brand.findAll({
        where: { slug: { [Op.in]: brands } },
        attributes: ["id"],
      }).then((brandsData) => brandsData.map((brand) => brand.id));
      
      if (brandIds.length > 0) {
        filterConditions.push({ brandId: { [Op.in]: brandIds } });
      }
    }

    // Vehicle Types filter - using direct relationship
    if (vehicle_type?.length > 0) {
      const vehicleTypeIds = await VehicleType.findAll({
        where: { slug: { [Op.in]: vehicle_type } },
        attributes: ["id"],
      }).then((typesData) => typesData.map((type) => type.id));
      
      if (vehicleTypeIds.length > 0) {
        filterConditions.push({ vehicleTypeId: { [Op.in]: vehicleTypeIds } });
      }
}

    if (websiteId) {
      filterConditions.push({ websiteId: { [Op.overlap]: [websiteId] } });
    }

    if (tag) {
      filterConditions.push({
        tags: {
          [Op.contains]: [tag],
        },
      });
    }

    filterConditions.push({ inStock: { [Op.gt]: 0 } });
    
    const products = await Product.findAll({
      attributes: [
        "id",
        "sku",
        "name",
        "slug",
        "images",
        "status",
        "tags",
        "inStock",
        "description",
      ],
      where: { [Op.and]: filterConditions },
      offset: parseInt(offset),
      limit: parseInt(pageSize),
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: [
            "currency",
            "discountType",
            "discountValue",
            "basePrice",
            "finalPrice",
          ],
          where: { currency },
          required: true,
        },
      ],
    });

    return res.json(message(true, "Product successfully retrieved", products));
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const getProductDetail = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const currency = req?.meta?.currency;

    const productList = {};

    // Consolidate product retrieval into a single query
    const product = await Product.findOne({
      where: { slug },
      attributes: [
      "id",
      "sku",
      "name", 
      "slug",
      "images",
      "status",
      "tags",
      "inStock",
      "description",
      "productCode",
      ],
      include: [
      {
        model: ProductPricing,
        as: "productPricing",
        attributes: [
        "currency",
        "discountType", 
        "discountValue",
        "basePrice",
        "finalPrice",
        ],
        where: { currency },
        required: true,
      },
      {
        model: ProductAttribute,
        as: "productAttributes",
        attributes: ["value"],
        include: [
        {
          model: Attribute,
          as: "attribute", 
          attributes: ["name"],
        },
        ],
      },
      {
        model: Category,
        as: "category",
        attributes: ["name", "slug"],
      },
      {
        model: SubCategory,
        as: "subCategory",
        attributes: ["name", "slug"], 
      },
      {
        model: Brand,
        as: "brand",
        attributes: ["name", "slug"]
      },
      {
        model: VehicleType,
        as: "vehicleType",
        attributes: ["name", "slug"]
      }
      ],
    });

    if (!product) {
      throw boom.notFound("Product not found");
    }

    if (product.productCode) {
      const relatedProducts = await Product.findAll({
        where: { productCode: product.productCode },
        attributes: [
          "id",
          "sku",
          "name",
          "slug",
          "images",
          "status",
          "tags",
          "inStock",
          "description",
          "productCode",
        ],
        include: [
          {
            model: ProductPricing,
            as: "productPricing",
            attributes: [
              "currency",
              "discountType",
              "discountValue",
              "basePrice",
              "finalPrice",
            ],
            where: { currency },
            required: true,
          },
        ],
      });
      if (relatedProducts?.length > 0)
        productList["relatedProducts"] = relatedProducts;
    }

    // Flatten product attributes for easier consumption
    const formattedProduct = {
      ...product.toJSON(),
      productAttributes: product.productAttributes.map((attr) => ({
        label: attr.attribute.name,
        value: attr.value,
      })),
    };

    productList["formattedProduct"] = formattedProduct;
    return res.json(
      message(true, "Product details retrieved successfully", productList)
    );
  } catch (error) {
    next(error);
  }
};

const getProductInformation = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const currency = req?.meta?.currency;

    const productList = {};

    // Consolidate product retrieval into a single query
    const product = await Product.findOne({
      where: { slug },
      attributes: [
        "id",
        "sku",
        "name",
        "slug",
        "images",
        "status",
        "tags",
        "inStock",
        "description",
        "productCode",
      ],
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: [
            "currency",
            "discountType",
            "discountValue",
            "basePrice",
            "finalPrice",
          ],
          where: { currency },
          required: true,
        }
      ],
    });

    if (!product) {
      throw boom.notFound("Product not found");
    }
    return res.json(
      message(true, "Product information retrieved successfully", product)
    );
  } catch (error) {
    next(error);
  }
};

const searchProducts = async (req, res, next) => {
  try {
    const { name } = req.params;

    const currency = req?.meta?.currency;
    
    const { Op } = require("sequelize");

    const relatedProducts = await Product.findAll({
      where: {
        name: {
          [Op.iLike]: `%${name}%`,
        },
        query :{ inStock :{ [Op.gt]: 0 }}
      },
      attributes: [
        "id",
        "sku",
        "name",
        "slug",
        "images",
        "status",
        "tags",
        "inStock",
        "description",
        "productCode",
      ],
      include: [
        {
          model: ProductPricing,
          as: "productPricing",
          attributes: [
            "currency",
            "discountType",
            "discountValue",
            "basePrice",
            "finalPrice",
          ],
          where: { currency },
          required: true,
        },
      ],
    });

    return res.json(
      message(true, "Product details retrieved successfully", relatedProducts)
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getAll,
  updateOne,
  getOne,
  deleteOne,
  updateStatus,
  productDropdown,
  attributeList,
  productList,
  assignTag,
  removeTag,
  getProductDetail,
  searchProducts,
  getSoftDeleted,
  restoreProducts,
  copyProduct,
  getProductInformation
};
