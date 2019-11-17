const express = require("express");
const models = require("../models");

const AppController = {
  async index(req, res) {
    let epochs = await models.Epoch.find();

    return res.render("index", { epochs });
  },

  async browse(req, res) {
    console.log("browse", req.method, req.params, req.query);
    const { id } = req.params;
    if (id) {
      let epoch = await models.Epoch.findById(req.params.id);
      console.log("details", epoch);
      return res.render("details", { epoch });
    }
    let epochs = await models.Epoch.find();
    console.log("browse", epochs);
    return res.render("browse", { epochs });
  },

  async details(req, res) {
    let epoch = await models.Epoch.findById(req.params.id);
    console.log("details", epoch);
    res.render("details", { epoch });
  }
};

module.exports = AppController;
