var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var stageTypes = {main: [], expert: [], special: [], mega: []};

var url = "http://www.serebii.net/shuffle/pokemon.shtml";

function hasDupl(list, division, item) {
  return list[division].some(function(listItem) {
    return listItem.pokemonName === item.pokemonName && listItem.location === item.location
  });
}

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
      }

      if (pokemonName.toLowerCase().startsWith('mega ')) {
        // M-Charizard X
        if (pokemonIcon.includes('-mx')) {
          pokemonName = pokemonName + '-X';
        }

        // Mega Shiny
        if (pokemonIcon.includes('-ms') || pokemonIcon.includes('-sm')) {
          pokemonName = pokemonName + '-S';
        }

        // Mega Winking
        if (pokemonIcon.includes('-mw')) {
          pokemonName = pokemonName + '-W';
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

  fs.writeFile('pokemonCollection.json', JSON.stringify(stageTypes, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    });
});
