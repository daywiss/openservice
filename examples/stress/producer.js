const lodash = require('lodash')
const highland = require('highland')

module.exports = (config,services)=>{
  function create(index){
    return {
      "amount": "1" ,
      "appid": 570 ,
      "assetid": "10002203072" ,
      "background_color": "" ,
      "classid": "360429921" ,
      "commodity": 0 ,
      "contextid": "2" ,
      "currency": 0 ,
      "descriptions": [
        {
          "type": "html" ,
          "value": "Used By: Skywrath Mage"
        } ,
        {
          "type": "html" ,
          "value": " "
        } ,
        {
          "color": "9da1a9" ,
          "type": "html" ,
          "value": "Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Sash of Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Cuffs of Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Mantle of Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Wings of Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Helm of Divine Ascension"
        } ,
        {
          "color": "6c7075" ,
          "type": "html" ,
          "value": "Staff of Divine Ascension"
        } ,
        {
          "type": "html" ,
          "value": "A helm befitting one who can ascend and raze his foes with divine arcana."
        } ,
        {
          "type": "html" ,
          "value": " "
        } ,
        {
          "type": "html" ,
          "value": "( Not Tradable )"
        } ,
        {
          "type": "html" ,
          "value": "( This item may be gifted once )"
        }
      ] ,
      "icon_url": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUhogJKXk3ET9ug1sjWHFVxKQloubyaLw522v3NTjxR79m4h4mEmbj8NrfcqWRX18F4nODP8LP0m1expQA1PDftLYDHcQE5ZgzSqQO_x-y8hpa9vZ3In3s1uXRz5irUl0a2gElFZ7c9heveFwulg8bm8g" ,
      "icon_url_large": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUhogJKXk3ET9ug1sjWHFVxKQloubyaLw522v3NTjxR79m4h4mEmbj8NrfcqWRX18F4nODP8LP0m1expQA1PDeceNfXJVMgYlrW-VG2l7q5gpPuvM_AzyBhvnYk5SuMyxG1iUpMbeNtgqTKG1WYVbsJQvfCqXen7Q" ,
      "id": index.toString(),
      "imageURL": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUhogJKXk3ET9ug1sjWHFVxKQloubyaLw522v3NTjxR79m4h4mEmbj8NrfcqWRX18F4nODP8LP0m1expQA1PDftLYDHcQE5ZgzSqQO_x-y8hpa9vZ3In3s1uXRz5irUl0a2gElFZ7c9heveFwulg8bm8g",
      "inspectURL": null ,
      "instanceid": "782509058" ,
      "largeImageURL": "https://steamcommunity-a.akamaihd.net/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KW1Zwwo4NUX4oFJZEHLbXK9QlSPcUhogJKXk3ET9ug1sjWHFVxKQloubyaLw522v3NTjxR79m4h4mEmbj8NrfcqWRX18F4nODP8LP0m1expQA1PDeceNfXJVMgYlrW-VG2l7q5gpPuvM_AzyBhvnYk5SuMyxG1iUpMbeNtgqTKG1WYVbsJQvfCqXen7Q",
      "market_hash_name": "Helm of Divine Ascension" ,
      "market_marketable_restriction": 0 ,
      "market_name": "Helm of Divine Ascension" ,
      "market_tradable_restriction": 7 ,
      "marketable": 0 ,
      "name": "Helm of Divine Ascension" ,
      "name_color": "D2D2D2" ,
      "quality": "Standard" ,
      "rarity": "Uncommon" ,
      "rarity_color": "5e98d9" ,
      "tags": [
        {
          "category": "Quality" ,
          "color": "D2D2D2" ,
          "internal_name": "unique" ,
          "localized_category_name": "Quality" ,
          "localized_tag_name": "Standard"
        } ,
        {
          "category": "Rarity" ,
          "color": "5e98d9" ,
          "internal_name": "Rarity_Uncommon" ,
          "localized_category_name": "Rarity" ,
          "localized_tag_name": "Uncommon"
        } ,
        {
          "category": "Type" ,
          "internal_name": "wearable" ,
          "localized_category_name": "Type" ,
          "localized_tag_name": "Wearable"
        } ,
        {
          "category": "Slot" ,
          "internal_name": "head" ,
          "localized_category_name": "Slot" ,
          "localized_tag_name": "Head"
        } ,
        {
          "category": "Hero" ,
          "internal_name": "npc_dota_hero_skywrath_mage" ,
          "localized_category_name": "Hero" ,
          "localized_tag_name": "Skywrath Mage"
        }
      ] ,
      "tradable": 0 ,
      "type": "Wearable" ,
      "userid": "15595ae8-07b2-4296-a637-bbf455dcd210"
    }
  }

  function stream(count){
    return highland((push,next)=>{
      lodash.times(count,i=>{
        push(null,lodash.cloneDeep(create(i)))
      })
      push(null,highland.nil)
    })
  }

  function array(count){
    return lodash.times(count,create)
  }



  return {
    stream,
    array
  }

}
