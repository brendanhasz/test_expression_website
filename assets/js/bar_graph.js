/* Draw a line */
function drawLine(element, x1, y1, x2, y2, arrow = false, stroke = "black"){
    var new_line = document.createElementNS('http://www.w3.org/2000/svg','line');
    new_line.setAttribute('x1', x1);
    new_line.setAttribute('y1', y1);
    new_line.setAttribute('x2', x2);
    new_line.setAttribute('y2', y2);
    new_line.setAttribute("stroke", stroke);
    if (arrow == true) {
        new_line.setAttribute("marker-end", "url(#arrowhead)");
    }
    element.append(new_line);
}

/* Draw a rectangle */
function drawRect(element, x, y, width, height, fill = "black"){
    var new_rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    new_rect.setAttribute('x', x);
    new_rect.setAttribute('y', y);
    new_rect.setAttribute('width', width);
    new_rect.setAttribute('height', height);
    new_rect.setAttribute("fill", fill);
    element.append(new_rect);
}

/* Draw text */
function drawText(element, x, y, text, font_size = 14){
    var new_text = document.createElementNS('http://www.w3.org/2000/svg','text');
    new_text.setAttribute('x', x);
    new_text.setAttribute('y', y);
    new_text.setAttribute("font-size", font_size);
    new_text.setAttribute("text-anchor", "middle");
    new_text.setAttribute("alignment-baseline", "hanging");
    var new_text_node = document.createTextNode(text);
    new_text.appendChild(new_text_node);
    element.append(new_text);
}

/* Draw a bar plot SVG. */
function barGraph(svg, labels, values, sems){

    // TODO: Make settings here optional args: colors, padding vlaues, xlims and ylims
    var bgcolor = "#eeeeee";
    var x_pad = 0.1;
    var y_pad = 0.1;
    var y_ax_pad = 0.1;
    var b_pad = 0.1;
    var sem_wid = 0.1;
    var colors = ["#E69F00", "#56B4E9", "#009E73", "#F0E442"];
    var ylims = null;

    // First, clear the existing SVG and replace it with some defs
    svg.innerHTML = `
        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="0" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
        </defs>
    `;

    // Get graph bounds
    var width = svg.width.baseVal.value;
    var height = svg.height.baseVal.value;    
    var g_x0 = x_pad * width;  // X axis origin
    var g_x1 = width - g_x0;  // X axis limit
    var g_dx = g_x1 - g_x0;
    var g_y0 = y_pad * height;  // Y axis origin
    var g_y1 = height - g_y0;  // Y axis limit
    var g_dy = g_y1 - g_y0;

    // Graph background
    drawRect(svg, g_x0, g_y0-10, g_dx+10, g_dy+10, bgcolor);

    // X ticks
    var x_tick_values = [];
    var x_tick_dx = g_dx / values.length;
    for (let i = 0; i < values.length; i++) {
        x_tick_values[i] = g_x0 + i * x_tick_dx + x_tick_dx / 2;
    }

    // X tick labels
    for (let i = 0; i < values.length; i++) {
        drawText(svg, x_tick_values[i], g_y1 + 10, labels[i]);
    }

    // Determine Y axis limits
    var ymin;
    var ymax;
    if (ylims == null) {
        ymin = values[0];
        ymax = values[0];
        for (let i = 0; i < values.length; i++) {
            if ( (values[i] + sems[i]) > ymax) {
                ymax = values[i] + sems[i];
            }
            if ( (values[i] - sems[i]) < ymin) {
                ymin = values[i] - sems[i];
            }
        }
        //add padding
        ymax = ymax + y_ax_pad * (ymax - ymin);
        ymin = ymin - y_ax_pad * (ymax - ymin);
    } else {
        ymin = ylims[0];
        ymax = ylims[1];
    }

    // Figure out where Y ticks should be
    // TODO: figure out where ticks should be
    // TODO: draw y ticks
    // TODO: draw y tick labels
    // TODO: draw y axis label

    // Draw bars
    for (let i = 0; i < values.length; i++) {
        bx = g_x0 + i * x_tick_dx + x_tick_dx * b_pad;
        by = (ymax - values[i]) / (ymax - ymin) * g_dy + g_y0;
        bw = x_tick_dx * (1 - 2 * b_pad);
        bh = g_y1 - by;
        drawRect(svg, bx, by, x_tick_dx - 2 * b_pad * x_tick_dx, bh, colors[i]);
    }

    // Draw SEM bars
    for (let i = 0; i < values.length; i++) {
        y0 = (ymax - values[i] - sems[i]) / (ymax - ymin) * g_dy + g_y0;
        y1 = (ymax - values[i] + sems[i]) / (ymax - ymin) * g_dy + g_y0;
        x0 = x_tick_values[i] - x_tick_dx * sem_wid;
        x1 = x_tick_values[i] + x_tick_dx * sem_wid;
        drawLine(svg, x_tick_values[i], y0, x_tick_values[i], y1);
        drawLine(svg, x0, y0, x1, y0);
        drawLine(svg, x0, y1, x1, y1);
    }

    // X axis
    drawLine(svg, g_x0, g_y1, g_x1, g_y1, true);

    // Y axis
    drawLine(svg, g_x0, g_y1, g_x0, g_y0, true);

}
