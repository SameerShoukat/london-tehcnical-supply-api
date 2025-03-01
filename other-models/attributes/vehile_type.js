// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/database');
// const { createSlug } = require("../../utils/hook");


// const Brand = sequelize.define('Brand', {
//     id: {
//       type: DataTypes.UUID,
//       primaryKey: true,
//       defaultValue: DataTypes.UUIDV4
//     },
//     name: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true
//     },
//     slug: {
//       type: DataTypes.STRING,
//       unique: true
//     },
//     productIds: {
//       type: DataTypes.ARRAY(DataTypes.UUID),
//       defaultValue: [],
//       allowNull: false
//     },
//     productCount: {
//       type: DataTypes.INTEGER,
//       defaultValue: 0
//     },
//     status: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true
//     }
//   }, {
//     tableName: 'brands',
//     timestamps: true,
//     hooks: {
//       beforeCreate: (brand) => {
//         brand.slug = createSlug(brand.name);
//       },
//       beforeUpdate: (brand) => {
//         if (brand.changed('name')) {
//           brand.slug = createSlug(brand.name);
//         }
//       }
//     }
// });

// module.exports = Brand;
  
//   // Function to sync ProductAttributes with Brand model
//   async function syncBrandsFromAttributes() {
//     try {
//       // Get the brand attribute ID (you'll need to store this somewhere)
//       const brandAttribute = await Attribute.findOne({ where: { name: 'brand' } });
      
//       // Get all unique brand values and their product counts
//       const brandValues = await ProductAttribute.findAll({
//         where: { attributeId: brandAttribute.id },
//         attributes: [
//           'value',
//           [sequelize.fn('array_agg', sequelize.col('productId')), 'productIds'],
//           [sequelize.fn('COUNT', sequelize.col('productId')), 'count']
//         ],
//         group: ['value']
//       });
  
//       // Upsert each brand
//       for (const brandValue of brandValues) {
//         await Brand.upsert({
//           name: brandValue.value,
//           productIds: brandValue.productIds,
//           productCount: brandValue.count
//         });
//       }
//     } catch (error) {
//       console.error('Error syncing brands:', error);
//       throw error;
//     }
//   }
  
//   // Trigger function to update Brand when ProductAttribute changes
//   async function updateBrandForProduct(productId, brandValue) {
//     const transaction = await sequelize.transaction();
    
//     try {
//       // Remove product from old brand
//       await Brand.update(
//         {
//           productIds: sequelize.fn('array_remove', sequelize.col('productIds'), productId),
//           productCount: sequelize.literal('product_count - 1')
//         },
//         {
//           where: {
//             productIds: { [Op.contains]: [productId] }
//           },
//           transaction
//         }
//       );
  
//       // Add product to new brand
//       const [brand] = await Brand.upsert({
//         name: brandValue,
//         productIds: sequelize.fn('array_append', sequelize.col('productIds') || '{}', productId),
//         productCount: sequelize.literal('product_count + 1')
//       }, { transaction });
  
//       await transaction.commit();
//       return brand;
//     } catch (error) {
//       await transaction.rollback();
//       throw error;
//     }
//   }
  
//   // Add hooks to ProductAttribute to maintain Brand synchronization
//   ProductAttribute.addHook('afterCreate', async (attribute) => {
//     const brandAttribute = await Attribute.findOne({ where: { name: 'brand' } });
//     if (attribute.attributeId === brandAttribute.id) {
//       await updateBrandForProduct(attribute.productId, attribute.value);
//     }
//   });
  
//   ProductAttribute.addHook('afterUpdate', async (attribute) => {
//     const brandAttribute = await Attribute.findOne({ where: { name: 'brand' } });
//     if (attribute.attributeId === brandAttribute.id && attribute.changed('value')) {
//       await updateBrandForProduct(attribute.productId, attribute.value);
//     }
//   });