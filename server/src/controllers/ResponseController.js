const BaseController = require('./BaseController');
const { Response, Template, User } = require('../models');
const { sendResponseEmail } = require('../services/emailService');

class ResponseController extends BaseController {
  constructor() {
    super(Response);
  }

  async createResponse(data, userId) {
    const response = await this.model.create({
      ...data,
      userId
    });

    if (data.emailCopy) {
      const template = await Template.findByPk(data.templateId, {
        include: [{ model: User, attributes: ['name'] }]
      });
      
      await sendResponseEmail(
        data.email,
        template,
        response,
        template.User.name
      );
      
      await response.update({ emailSent: true });
    }

    return response;
  }

  async getUserResponses(userId, options = {}) {
    return this.model.findAll({
      where: { userId },
      include: [
        {
          model: Template,
          attributes: ['id', 'title', 'description']
        }
      ],
      ...options,
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new ResponseController(); 