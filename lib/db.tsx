const { Sequelize, DataTypes, Model, Op } = require("sequelize");

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

class MediaItem extends Model {
  declare id: string;
  declare albumId: string;
  declare productUrl: string;
  declare baseURL: string;
  declare mimeType: string;
  declare filename: string;
  declare creationTime: string;
  declare width: string;
  declare height: string;
  declare photo: boolean;
  declare video: boolean;
}

MediaItem.init(
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    albumId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    creationTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    width: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    height: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    photo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    video: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  { sequelize }
);

await sequelize.sync();

export { KeyStore, MediaItem, Op };
