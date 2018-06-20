"use strict";
const loadAllItems = require("./datbase").loadAllItems;
const loadPromotions = require("./datbase").loadPromotions;

function printInventory(inputs){
    let result = '***<没钱赚商店>购物清单***\n';
    let cu = complete_userinput(format_userInput(inputs));
    let aps = addPromotionSave(cu);
    cu.forEach(item =>{
        result += '名称：' + item.name + '，数量：'+ item.count + item.unit + '，单价：' + item.price + '(元)，小计：'+ item.smallsum1 +'(元)\n'
    });
    result += '----------------------\n';
    if(aps.giveOrnot == 1){
        result += '挥泪赠送商品：\n';
    }
    cu.forEach(item =>{
        if(item.isProduce == 1 && item.count >= 2){
            result += '名称：' + item.name +'，数量：' + item.giveNumber + item.unit +'\n';
        }
    });
    result +='----------------------\n';
    result += '总计：' + aps.sum + '(元)\n';
    result += '节省：'+ aps.cutSaved + '(元)\n';
    result +='**********************';
    console.log(result);
}

//格式化用户输入
function format_userInput(inputs){
    let formated_userinput = [];
    let temp = [];
    let count = 0;
    inputs.forEach(item_inputs =>{
        if(item_inputs.length>10){
            count = parseInt(item_inputs.split("-")[1]);
        }else{
            count = 0;
        }
        let barcode = item_inputs.split("-")[0];
        if(count !=0){
            temp.push(barcode);
        }
        temp.push(barcode);
    });
    for (let i = 0; i < temp.length;) {
        let count = 0;
        for (let j = i; j < temp.length; j++) {
            if (temp[i] === temp[j]) {
                count++;
            }
        }
        formated_userinput.push({
            barcode: temp[i],
            count: count
        })
        i+=count;
    }
    // console.log(formated_userinput);
    return formated_userinput;
}

//完成用户输入,添加price,unit,name
function complete_userinput(formated_userinput){
    let completed_userinput = formated_userinput;
    let allItems =loadAllItems();
    let promo = loadPromotions()[0].barcodes;
    let smallsum = 0;
    // console.log(promo);
    //加入单价信息
    completed_userinput.forEach(item_user=>{
        allItems.forEach(item_all =>{
            if(item_user.barcode.trim() === item_all.barcode.trim()){
                item_user.name = item_all.name;
                item_user.unit = item_all.unit;
                item_user.price = item_all.price.toFixed(2);
                item_user.smallsum = parseFloat(item_user.price * item_user.count);   // 总价
                // console.log(item_user.smallsum);
            }

        });
    });
    completed_userinput.forEach(item =>{
        item.isProduce = 0;
    })
    //加入优惠信息
    completed_userinput.forEach(value_user =>{
        promo.forEach(value_pro =>{
            if(value_user.barcode.trim() == value_pro.trim()){
                value_user.isProduce = 1;  //单品参加活动
            }
        });
    });
    // console.log(completed_userinput);
    return completed_userinput;
}

//添加节省金额
function addPromotionSave(completed_userinput){
    let addedPromotionSave = {};
    let cutSaved = 0;
    let sum = 0;
    let give = 0;
    let giveNumber = 0;
    let smallsum = 0.00;
    //求目前总和
    completed_userinput.forEach(item =>{
        if(item.count >=2 && item.isProduce === 1){
            giveNumber =  parseInt(item.count/3);
            item.giveNumber = giveNumber;
            smallsum = parseFloat(item.smallsum - item.price * item.giveNumber);
            item.smallsum = smallsum;
            item.smallsum1 = smallsum.toString()+".00";
            cutSaved += item.price * giveNumber;
            give = 1;
        }else{
            smallsum = parseFloat(item.smallsum);
            item.smallsum1 = smallsum.toString()+".00";
        }
    });
    completed_userinput.forEach(item =>{
        sum += item.smallsum;
    });
    // console.log(completed_userinput);
    addedPromotionSave.cutSaved = cutSaved.toFixed(2);
    addedPromotionSave.sum = sum.toString()+ ".00";
    addedPromotionSave.giveOrnot = give;
    return addedPromotionSave;
}

module.exports = printInventory;