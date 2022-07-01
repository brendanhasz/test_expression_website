/* Page load tasks and callbacks */

// Load the CSV
var gene_expression = loadExpressionCSV("data/data.csv");
// NOTE: Need to use nonlocal link below when developing, otherwise CORS errors :roll_eyes:
//var gene_expression = loadExpressionCSV("https://raw.githubusercontent.com/brendanhasz/test_expression_website/main/data/data.csv");

// Set the autocomplete candidates to the gene names
autocomplete(document.getElementById("geneInput"), Object.keys(gene_expression));

/* Add a gene to the plot */
function plotExpression() {

    console.log("plotExpression ...");

    // Get the gene, comparison type, and gender
    var gene_name = document.getElementById("geneInput").value;
    var comparison_type = document.getElementById("comparison_type").value;
    var gender = document.getElementById("gender").value;

    // Don't update if no valid gene entered
    if (!(gene_name in gene_expression)) return false;

    console.log("gene_name:", gene_name);
    console.log("comparison_type:", comparison_type);
    console.log("gender:", gender);

    // Get labels, values, and SEM for each bar
    // TODO

    // Draw the graph
    // TODO
    //redrawGraph("#bar_chart", gene_expression, displayed_genes)
    document.getElementById("bar_chart").innerHTML = "<img src='https://icon-library.com/images/chart-icon-svg/chart-icon-svg-4.jpg' width='800px' height='500px'>";

    // Update fold change text
    var log_fold_change;
    switch (comparison_type) {
        case "wf-wc":
            log_fold_change = gene_expression[gene_name][6];
            break;
        case "df-wf":
            log_fold_change = gene_expression[gene_name][7];
            break;
        case "df-dc":
            log_fold_change = gene_expression[gene_name][8];
            break;
        case "dc-wc":
            log_fold_change = gene_expression[gene_name][9];
            break;
    }
    document.getElementById("log_fold_change").innerHTML = `Log2 of Transcript Count Fold Change: <b>${log_fold_change}</b>`;

    // Reset input
    document.getElementById("geneInput").value = "";
}
