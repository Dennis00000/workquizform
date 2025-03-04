class BaseController {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return this.model.create(data);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async update(id, data) {
    const [updated] = await this.model.update(data, {
      where: { id }
    });
    if (!updated) {
      throw new Error('Record not found');
    }
    return this.findById(id);
  }

  async delete(id) {
    const deleted = await this.model.destroy({
      where: { id }
    });
    if (!deleted) {
      throw new Error('Record not found');
    }
    return true;
  }
}

module.exports = BaseController; 