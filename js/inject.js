$.extend({
    trim : function(str){
        return str.replace(/^\s*/, "").replace(/\s*$/, "");
    }
});

function Grade(i,n,y,s,u,v) {
    this.id = parseInt(i);
    this.name = n.replace(/^\s*/, '').replace(/\s*$/, '');
    this.year = parseInt(y);
    this.semester = parseInt(s);
    this.ects = parseFloat(u);
    this.value = parseInt(v);
}

Grade.prototype.is_valid = function() {
    if (!this.name || this.value == 0) {
        return false;
    }
    return true;
    };

Grade.prototype.toString = function() {
    return sprintf('id=%d year=%d semester=%d ucts=%f value=%d', [self.id, self.year, self.semester, self.ucts, self.value]);
};

function HistoryLine(i,d,v) {
    d = $.trim(d).split("-");
    var _d = new Date(d[2], d[1], d[0]);
    var months = [1,2,3,6,7,9,10];
    this.id = parseInt(i);
    this.date = _d;
    this.year = _d.getFullYear();
    if ( months.indexOf(_d.getMonth() + 1) ) {
        this.year = _d.getFullYear() - 1;
    }
    this.value = parseInt(v);
}

function getDisciplinas() {
    var disciplines_html = $('.table_cell_par, .table_cell_impar');
    disciplines_html.each(function(index,value) {
        var _ds = $('td', value);
        var option = _ds.eq(0).find('img');
        if (option.length) {
            var table = _ds.parents('tr + tr').find('table');
            var _ds = table.find('tbody > tr:not(.table_topcol) > td');
        }
        var grade = new Grade(_ds.eq(1).html(), _ds.eq(2).text(), _ds.eq(3).html(), _ds.eq(4).html(), _ds.eq(6).html(), _ds.eq(7).html());
        if (grade.is_valid()) {
            this.grades[grade.id] = grade;
        }
    }.bind(this));
    return this;
}

function getHistoryGrades() {
    var disciplines_html = $("#history").contents().find('.table_cell_par, .table_cell_impar');
    disciplines_html.each(function(index,value) {
        var _ds = $('td', value);
        var hline = new HistoryLine(_ds.eq(0).html(), _ds.eq(2).text(), _ds.eq(3).html());
        if (this.history[hline.year] == undefined){ this.history[hline.year] = []; }
        this.history[hline.year].push(hline);
    }.bind(this));
    return this;    
}

function fromLinesToGrades(grades, hlines){
    var ret = {}
    for (i in hlines){
        var h = hlines[i].id;
        if (grades[h]) {
            ret[h] = grades[h];
        }
    }
    return ret;
}

function calcMean() {
    var disciplinas = getDisciplinas.bind({ grades: {} })();
    var grades = disciplinas.grades;
    ret = _calcMeanSingle(grades).mean;
    return { mean : ret, grades : grades, disciplinas: disciplinas }
}

function _calcMeanSingle(grades){
    var weights = 0, total_ects = 0;
    /* Calculate mean */
    for (var i in grades) {
        var g = grades[i];
        if (g.value) {
            weights += g.value * g.ects;
            total_ects += g.ects;
        }
    }
    var mean = weights / total_ects;
    return { mean : mean, weights: weights, ects : total_ects};
}

function calcHistoryMeanAll(current_mean, grades){
    $("body").append("<iframe id=\"history\" src=\"https://paco.ua.pt/secvirtual/c_historiconotas.asp\"></iframe>");
    $("#history").load(function(evt){
        var sent = {};
        var data = getHistoryGrades.bind({ history: {} })();
        var weights = 0, ects = 0;
        for(year in data.history){
            var hlines = data.history[year]; 
            var mean = _calcMeanSingle(fromLinesToGrades(grades, hlines));
            weights += mean.weights;
            ects += mean.ects;
            sent[year] = weights/ects;
            renderYearMean(year, sent[year]);
        }
        sendHistoryMean(sent);
        renderMean(current_mean);
    }.bind(this));
}

/** Send to Extension */
function sendToBase(data) { chrome.extension.sendRequest(data); }
function sendMean(value){ sendToBase({ mean : value }); }
function sendHistoryMean(values){ sendToBase({ history : values } ) }
function sendGrades(values){ sendToBase({ grades : values } ) }

/** Render */
function renderMean(value){
    $('#template_main > table:eq(1) > tbody').append('<tr class=\"table_cell_impar\"><td align=\"left\">Media Ponderada</td><td align=\"right\">'+ value.toFixed(2) + '</td></tr>');
}

function renderYearMean(year, value){
    $('#template_main > table:eq(1) > tbody').append('<tr class=\"table_cell_impar\"><td align=\"left\">Media Ponderada ('+year+')</td><td align=\"right\">'+ value.toFixed(2) + '</td></tr>');
}

$(document).ready(function(evt) {
    var curr = calcMean();
    sendMean(curr.mean);
    var history = calcHistoryMeanAll(curr.mean, curr.grades);
});

