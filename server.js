var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var stageTypes = {main: [], expert: [], special: [], mega: []};

var url = "http://www.serebii.net/shuffle/pokemon.shtml";

request(url, function (error, response, body) {
  var pokemonTable;
  if (!error) {
    var $ = cheerio.load(body);
    $('.dextable > tr:not(:first-of-type)').each(function () {
      var pokemon = {pokemonName : "", pokemonIcon: "", location: ""};
      var pokemonName = $(this).find('.fooinfo:nth-of-type(3)').text();
      var pokemonStage = $(this).find('.fooinfo:nth-of-type(7)').text();
      var pokemonIcon = 'http://www.serebii.net' + $(this).find('.cen[width=68] td img').attr('src');
      var pokemonLocation = '' + pokemonStage.match(/\d+/);
      var suffixArr = ['w', 's', 'c', 'o', 't', 'm', 'ha', 'p', 'r', 'f'];
      var stagesArr = [
        'Puerto Blanco',
        'Sandy Bazaar',
        'Night Festival',
        'Isla Azul',
        'Rainbow Park',
        'Galerie Rouge',
        'Sweet Strasse',
        'Silbern Museum',
        'Mt. Vinter',
        'Castle Noapte',
        'Jungle Verde',
        'Wacky Workshop',
        'Pedra Valley',
        "Albens Town",
        'Roseus Center',
        'Desert Umbra',
        'Violeta Palace',
        'Blau Salon',
        'Glaucus Hall'
      ];

      // trim RMLs & assign pokemon values
      if (pokemonName.includes('2') || pokemonName.includes('3') || pokemonName.includes('5') || pokemonName.includes('10')) {
        pokemonName = pokemonName.slice(0, pokemonName.length - 2);
      } else {
        pokemonName = pokemonName;
      }

      // M-zard X
      if (pokemonName.toLowerCase().startsWith('mega ')) {
        if (pokemonIcon.includes('-mx')) {
          pokemonName = pokemonName + '-X';
        }
        if (pokemonIcon.includes('-ms')) {
          pokemonName = pokemonName + '-S';
        }
        stageTypes.mega.push(pokemon);
      } else {
        // handle different formes
        suffixArr.forEach(function (suffix) {
          if (pokemonIcon.toLowerCase().includes('-' + suffix)) {
            pokemonName = pokemonName + '-' + suffix.toUpperCase();
          }
        });
      }
      pokemon.pokemonName = pokemonName;
      pokemon.pokemonIcon = pokemonIcon;
      if (pokemonLocation === "null") {
        pokemonLocation = "";
      } else {
        pokemon.location = pokemonLocation;
      }

      if (pokemonStage.includes('Special')) {
        stageTypes.special.push(pokemon);
      }
      if (pokemonStage.includes('Expert') || pokemonStage.includes('EX')) {
        if (!hasDupl(stageTypes, 'expert', pokemon)) {
          stageTypes.expert.push(pokemon);
        }
      }
      stagesArr.forEach(function (stage) {
        if (pokemonStage.includes(stage)) {
          stageTypes.main.push(pokemon);
        }
      });
    });
      
  } else {
    console.log("We’ve encountered an error: " + error);
  }

  fs.writeFile('output.json', JSON.stringify(stageTypes, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    });
});

var hasDupl = function(list, division, item) {
  var duplicated = false;
  list[division].forEach(function (listItem) {
    if (listItem.pokemonName === item.pokemonName && listItem.location === item.location) {
      duplicated = true;
    }
  });

  return duplicated;
}
