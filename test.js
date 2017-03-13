var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash');
var stageTypes = {main: [], expert: [], special: [], mega: []};

var url = "http://pokemondb.net/spinoff/shuffle/stages";
var baseUrl = "http://bulbapedia.bulbagarden.net/wiki/";
var stagesArr = [
  'Expert_Stages',
  'Puerto_Blanco',
  'Sandy_Bazaar',
  'Night_Festival',
  'Isla_Azul',
  'Rainbow_Park',
  'Galerie_Rouge',
  'Sweet_Strasse',
  'Silbern_Museum',
  'Mt._Vinter',
  'Castle_Noapte',
  'Jungle_Verde',
  'Wacky_Workshop',
  'Pedra_Valley',
  "Albens_Town",
  'Roseus_Center',
  'Desert_Umbra',
  'Violeta_Palace',
  'Blau_Salon',
  'Glaucus_Hall',
  'Nacht_Carnival'
];

_.map(stagesArr, phase => {
  let targetUrl = baseUrl + phase;
  request(targetUrl, function (error, response, body) {
    if (!error) {
      var $ = cheerio.load(body);
      $('table.roundy tr').each(function () {
        var pokemon = {pokemonName : "", pokemonIcon: "", location: ""};
        var pokemonStage = $(this).find('td:first-of-type').text();
        var pokemonName = $(this).find('td:nth-of-type(3) a').text();
        var pokemonIcon = $(this).find('td:nth-of-type(2) img').attr('src');
        var pokemonLocation = pokemonStage;
        var suffixArr = ['w', 's', 'c', 'o', 't', 'm', 'ha', 'p', 'r', 'f'];

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
        }
        pokemon.pokemonName = pokemonName;
        pokemon.pokemonIcon = _.trim(pokemonIcon);
        if (pokemonLocation) {
          pokemon.location = _.trim(pokemonLocation);
        } else {
          pokemon.location = '';
        }

        if (!isNaN(pokemon.location) && pokemon.location.length > 0 && !pokemon.location.includes('EX')) {
          pokemon.location = _.trim(pokemon.location);
          stageTypes.main.push(pokemon);
        } else if (pokemon.location.includes('EX')) {
          pokemon.location = _.toString(pokemon.location.match(/\d+/g));
          stageTypes.expert.push(pokemon);
        }

      });

      fs.writeFile('output-test.json', JSON.stringify(stageTypes, null, 4), function(err){
          console.log('File successfully written! - Check your project directory for the output.json file');
      });
      console.log('stageTypes: ', stageTypes);
    } else {
      console.log("We’ve encountered an error: " + error);
    }
  });

  /*
  fs.writeFile('output-test.json', JSON.stringify(stageTypes, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
  });
  */
});




function hasDupl(list, division, item) {
  return list[division].some(function(listItem) {
    return listItem.pokemonName === item.pokemonName && listItem.location === item.location
  });
}

/*
request(url, function (error, response, body) {
  var pokemonTable;
  if (!error) {
    var $ = cheerio.load(body);
    $('.data-table > tr').each(function () {
      var pokemon = {pokemonName : "", pokemonIcon: "", location: ""};
      var pokemonStage = $(this).find('td:first-of-type').text();
      var pokemonName = $(this).find('td.cell-icon-string .infocard-data a').text();
      var pokemonIcon = 'http://www.serebii.net' + $(this).find('.cen[width=68] td img').attr('src');
      var pokemonLocation = '' + pokemonStage.match(/\d+/);
      var suffixArr = ['w', 's', 'c', 'o', 't', 'm', 'ha', 'p', 'r', 'f'];
      var stagesArr = [
        'Puerto_Blanco',
        'Sandy_Bazaar',
        'Night_Festival',
        'Isla_Azul',
        'Rainbow_Park',
        'Galerie_Rouge',
        'Sweet_Strasse',
        'Silbern_Museum',
        'Mt._Vinter',
        'Castle_Noapte',
        'Jungle_Verde',
        'Wacky_Workshop',
        'Pedra_Valley',
        "Albens_Town",
        'Roseus_Center',
        'Desert_Umbra',
        'Violeta_Palace',
        'Blau_Salon',
        'Glaucus_Hall',
        'Nacht_Carnival'
      ];

      // trim RMLs & assign pokemon values
      if (pokemonName.includes('2') || pokemonName.includes('3') || pokemonName.includes('5') || pokemonName.includes('10')) {
        pokemonName = pokemonName.slice(0, pokemonName.length - 2);
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
*/
