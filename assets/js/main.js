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

    // Get labels, values, and SEM for each bar
    var v0; // Column with value for bar 1
    var v1; // Column with value for bar 2
    var s0; // Column with SEM for bar 1
    var s1; // Column with SEM for bar 2
    var lfc; // Column with log fold change
    switch (comparison_type) {
        case "wf-wc":
            v0 = 3;
            v1 = 2;
            s0 = 15;
            s1 = 14;
            lfc = 6;
            break;
        case "df-wf":
            v0 = 5;
            v1 = 3;
            s0 = 17;
            s1 = 15;
            lfc = 7;
            break;
        case "df-dc":
            v0 = 5;
            v1 = 4;
            s0 = 17;
            s1 = 16;
            lfc = 8;
            break;
        case "dc-wc":
            v0 = 4;
            v1 = 2;
            s0 = 16;
            s1 = 14;
            lfc = 9;
            break;
    }
    var all_labels = ["", "", "WT Control", "WT Fracture", "DTR Control", "DTR Fracture"];
    var gene_values = gene_expression[gene_name];
    var labels = [all_labels[v0], all_labels[v1]];
    var values = [parseFloat(gene_values[v0]), parseFloat(gene_values[v1])];
    var sems = [parseFloat(gene_values[s0]), parseFloat(gene_values[s1])];
    var log_fold_change = gene_values[lfc];

    // Clear existing graph, the draw the new graph
    barGraph(document.getElementById("bar_chart"), labels, values, sems);

    // Update fold change text
    document.getElementById("log_fold_change").innerHTML = `Log2 of Transcript Count Fold Change: <b>${log_fold_change}</b>`;

    // Reset input
    document.getElementById("geneInput").value = "";
}
