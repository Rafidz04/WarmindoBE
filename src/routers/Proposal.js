const Router = require('express').Router();
const Proposal = require('../controllers/Proposal');

Router.post('/addkategory', Proposal.addKategory);
Router.delete('/deletekategory', Proposal.deleteKategory);
Router.get('/getkategory', Proposal.getKategory);
Router.get('/getproposal', Proposal.getProposal);
Router.post('/pengajuanproposal', Proposal.tambahkanProposal);
Router.patch('/responproposal', Proposal.responProposal);

module.exports = Router;
