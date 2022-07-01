/* Load the expression CSV. */
function loadExpressionCSV(path){

    // Load the file
    var client = new XMLHttpRequest();
    client.open("GET", path, false);
    client.send();
    var raw_text = client.responseText;

    // columns
    var gene_symbol_col = 1;

    // Parse the file
    var gene_expression = {};
    var text_lines = raw_text.split('\n');
    for (var i = 1; i < text_lines.length-1; i++) {
        var this_line = text_lines[i].split(',');
        gene_expression[this_line[gene_symbol_col]] = this_line;
    }

    return gene_expression

}
