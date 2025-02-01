module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First remove any existing foreign key constraint
    await queryInterface.removeConstraint('Catalogs', 'Catalogs_userId_fkey');
    
    // Change the column type to UUID
    await queryInterface.changeColumn('Catalogs', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
  }
};