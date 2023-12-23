const { Sequelize, DataTypes, Model } = require("sequelize");

const sequelize = new Sequelize("sqlite:data.db");

class KeyStore extends Model {
  declare Key: string;
  declare Value: string;
}

KeyStore.init(
  {
    Key: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    Value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize }
);

await sequelize.sync();

export { KeyStore };
