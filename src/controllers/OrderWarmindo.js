const Axios = require("axios");
const OrderWarmindo = require("../models/OrderWarmindo");
const ListOrderWarmindo = require("../models/ListOrderWarmindo");
const StockWarmindo = require("../models/StokWarmindo")

class Controller {
  static addOrderWarmindo(req, res, next) {
    let orderArr = JSON.parse(req.body.orderArr);
    let { namaPelanggan } = req.body;
    OrderWarmindo.create({ namaPelanggan: namaPelanggan })
      .then((response) => {
        orderArr.map((val) => {
           return StockWarmindo.updateOne({_id:val.idStock},{$inc:{totalStock:-1*Number(val.kuantitas)}}).then((respon)=>{
            return ListOrderWarmindo.create({
              idOrder: response._id,
              idStock: val.idStock,
              kategori:val.kategori,
              kuantitas: val.kuantitas,
              totalKuantitas: val.totalKuantitas,
            });
           })
          }) 
      }).then((respon)=>{
        res.status(200).json({status:200,message:"Anda berhasil order"})
      }).catch(next)
  }
  static getOrderWarmindo(req, res, next) {
   OrderWarmindo.aggregate([
    {$match:{}},
    {
      $lookup:{
        from: "listorderwarmindos",
        let:{
          idOrder:"$_id"
        },
        pipeline:[
          {
            $match:{
              $expr:{
                $and:[{$eq:["$idOrder","$$idOrder"]}]
              }
            }
          },
          {
            $lookup:{
              from:"stokwarmindos",
              let:{
                idStock:"$idStock"
              },
              pipeline:[
                {
                  $match:{
                    $expr:{
                      $and:[{$eq:["$_id","$$idStock"]}]
                    }
                  }
                }
              ],
              as:"namasss"
            }
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: [{ $arrayElemAt: ["$namasss", 0] }, "$$ROOT"],
              },
            },
          },
          { $project: { namasss: 0 } },
        ],
        as: "items",
      }
    },
    {
      $sort: { createdAt: -1 },
    },
   ]).then((respon) => {
    res.status(200).json({status:200,data:respon});
  })
  .catch(next);
  }
  static deleteOrderWarmindo(req, res, next) {
    let { _id } = req.body;

    if (_id == "") {
      throw {
        message: "Maaf ID tidak boleh kosong",
      };
    } else {
      OrderWarmindo.findOne({ _id })
        .then((response) => {
          if (response == null) {
            throw {
              message: "Maaf Order tidak ada",
            };
          } else {
            return OrderWarmindo.deleteOne({ _id });
          }
        })
        .then((response) => {
          res.status(200).json({
            status: 200,
            message: "Order berhasil didelete!",
          });
        })
        .catch(next);
    }

    // StokWarmindo.findByIdAndDelete({ _id })
    //   .then((response) => {
    //     res.status(200).json({
    //       status: 200,
    //       data :response,
    //       message: "Stok berhasil didelete!",
    //     });
    //   })
    //   .catch(next);
  }
}

module.exports = Controller;
