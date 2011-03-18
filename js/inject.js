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
            this.grades.push(grade);
        }
    }.bind(this));
    return this;
}

$(document).ready(function(evt) {
    var disciplinas = getDisciplinas.bind({ grades: [] })();
    var grades = disciplinas.grades;
    var weights = 0, total_ects = 0;
    /* Calculate mean */
    for (var i = 0; i < grades.length; ++i) {
        var g = grades[i];
        if (g.value) {
            weights += g.value * g.ects;
            total_ects += g.ects;
        }
    }
    var mean = weights / total_ects;
    $('#template_main > table:eq(1) > tbody').append('<tr class=\"table_cell_impar\"><td align=\"left\">Media Ponderarada</td><td align=\"right\">'+ mean + '</td></tr>');
});

