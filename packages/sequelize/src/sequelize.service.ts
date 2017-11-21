import { NotFoundError, RestController, RestParams } from '@foal/core';

import { SequelizeConnectionService } from './sequelize-connection.service';

export abstract class SequelizeService implements RestController {
  protected model: any;

  constructor(name: string, schema: any, connection: SequelizeConnectionService) {
    this.model = connection.sequelize.define(name, schema);
  }

  public async create(data: any, params: RestParams): Promise<any> {
    await this.model.sync();

    if (Array.isArray(data)) {
      const models = await this.model.bulkCreate(data, {
        // Ask Postgres to return ids.
        returning: true
      });
      return models.map(e => e.dataValues);
    }

    const model = await this.model.create(data);
    return model.dataValues;
  }

  public async get(id: any, params: RestParams): Promise<any> {
    await this.model.sync();

    const result = await this.model.findById(id);
    if (result === null) {
      throw new NotFoundError();
    }
    return result.dataValues;
  }

  public async getAll(params: RestParams): Promise<any> {
    await this.model.sync();

    const models = await this.model.findAll({
      where: params.query
    });
    return models.map(e => e.dataValues);
  }

  public async update(id: any, data: any, params: RestParams): Promise<any> {
    await this.model.sync();

    if (data.id) {
      delete data.id;
    }

    await this.model.update(data, {
      where: { id }
    });

    const model = await this.model.findById(id);
    if (model === null) {
      throw new NotFoundError();
    }
    return model.dataValues;
  }

  public async patch(id: any, data: any, params: RestParams): Promise<any> {
    return this.update(id, data, params);
  }

  public async delete(id: any, params: RestParams): Promise<any> {
    await this.model.sync();

    const result = await this.model.destroy({
      where: { id }
    });
    if (result === 0) {
      throw new NotFoundError();
    }
  }
}