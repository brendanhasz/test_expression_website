/* Draw a line */
function drawLine(element, x1, y1, x2, y2, arrow = false, stroke = "black", stroke_width = null){
    var new_line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    new_line.setAttribute('x1', x1);
    new_line.setAttribute('y1', y1);
    new_line.setAttribute('x2', x2);
    new_line.setAttribute('y2', y2);
    new_line.setAttribute("stroke", stroke);
    if (arrow == true) {
        new_line.setAttribute("marker-end", "url(#arrowhead)");
    }
    if (stroke_width !== null) {
        new_line.setAttribute("stroke-width", stroke_width);
    }
    element.append(new_line);
}

/* Draw a rectangle */
function drawRect(element, x, y, width, height, fill = "black", stroke_width = null, stroke_color = null, hovertext = null){
    var new_rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    new_rect.setAttribute('x', x);
    new_rect.setAttribute('y', y);
    new_rect.setAttribute('width', width);
    new_rect.setAttribute('height', height);
    new_rect.setAttribute("fill", fill);
    if (stroke_width !== null) {
        new_rect.setAttribute("stroke-width", stroke_width);
        new_rect.setAttribute("stroke", stroke_color);
    }
    if (hovertext !== null) {
        var new_title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        new_title.innerHTML = hovertext;
        new_rect.appendChild(new_title);
    }
    element.append(new_rect);
}

/* Draw text */
function drawText(element, x, y, text, font_size, text_anchor, alignment_baseline, transform = null, font_style = null){
    var new_text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    new_text.setAttribute('x', x);
    new_text.setAttribute('y', y);
    new_text.setAttribute("font-size", font_size);
    new_text.setAttribute("text-anchor", text_anchor);
    new_text.setAttribute("alignment-baseline", alignment_baseline);
    if (transform !== null) {
        new_text.setAttribute("transform", transform);
        new_text.setAttribute("transform-origin", `${x} ${y}`);
    }
    if (font_style !== null) {
        new_text.setAttribute("font-style", font_style);
    }
    var new_text_node = document.createTextNode(text);
    new_text.appendChild(new_text_node);
    element.append(new_text);
}

/* Draw an X axis tick label */
function draw_x_tick_label(element, x, y, text){
    drawText(element, x, y, text, 14, "middle", "hanging");
}

/* Draw a Y axis tick label */
function draw_y_tick_label(element, x, y, text){
    drawText(element, x, y, text, 14, "end", "middle");
}

/* Draw Y axis label */
function draw_y_label(element, x, y, text){
    drawText(element, x, y, text, 14, "middle", "hanging", "rotate(270)");
}

/* Draw title */
function draw_title(element, x, y, text){
    drawText(element, x, y, text, 16, "middle", "hanging", null, "oblique");
}

/* Draw a bar plot SVG. */
function barGraph(svg, labels, values, sems, title = "", ylabel = ""){

    // TODO: Make settings here optional args: colors, padding vlaues, xlims and ylims
    var bgcolor = "#eeeeee";
    var ytick_color = "#f8f8f8";
    var x_pad = 0.1;
    var y_pad = 0.1;
    var y_ax_pad = 0.1;
    var b_pad = 0.1;
    var sem_wid = 0.1;
    var sem_stroke_width = 3;
    var box_stroke_width = 3;
    var colors = ["#E69F00", "#56B4E9", "#009E73", "#F0E442"];
    var fill_colors = ["#ffd375", "#a9d8f4", "#00e6a8", "#f7f2a1"];
    var ylims = null;
    var arrow_size = 10;
    var label_pad = 10;
    var ytick_stroke_width = 2;

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
    drawRect(svg, g_x0, g_y0-arrow_size, g_dx+arrow_size, g_dy+arrow_size, bgcolor);

    // X ticks
    var x_tick_values = [];
    var x_tick_dx = g_dx / values.length;
    for (let i = 0; i < values.length; i++) {
        x_tick_values[i] = g_x0 + i * x_tick_dx + x_tick_dx / 2;
    }

    // X tick labels
    for (let i = 0; i < values.length; i++) {
        draw_x_tick_label(svg, x_tick_values[i], g_y1 + label_pad, labels[i]);
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
    var n_tick_target = 8;  // want there to be roughly this many ticks
    var dtick_target = (ymax - ymin) / n_tick_target;
    var dtick_scale = Math.pow(10, Math.floor(Math.log10(dtick_target)));
    var tick_multiples = [1, 2, 5, 10];
    var best_tick_diff = 100000;
    var tick0;
    var tickd
    var tickn;
    for (let i = 0; i < tick_multiples.length; i++) {
        this_dtick = dtick_scale * tick_multiples[i];
        t0 = this_dtick * Math.ceil(ymin / this_dtick);
        t1 = this_dtick * Math.floor(ymax / this_dtick);
        this_nticks = (t1 - t0) / this_dtick;
        if (Math.abs(this_nticks - n_tick_target) < best_tick_diff) {
            best_tick_diff = Math.abs(this_nticks - n_tick_target);
            tick0 = t0;
            tickd = this_dtick;
            tickn = this_nticks;
        }
    }

    // Draw yticks
    for (let i = 0; i <= tickn; i++) {
        tick_value = tick0 + i * tickd;
        ty = (ymax - tick_value) / (ymax - ymin) * g_dy + g_y0;
        drawLine(svg, g_x0, ty, g_x1+arrow_size, ty, false, ytick_color, ytick_stroke_width);
        draw_y_tick_label(svg, g_x0 - label_pad, ty, `${tick_value}`);
    }

    // Draw Y axis label
    draw_y_label(svg, 0, height/2, ylabel);

    // Draw bars
    for (let i = 0; i < values.length; i++) {
        bx = g_x0 + i * x_tick_dx + x_tick_dx * b_pad;
        by = (ymax - values[i]) / (ymax - ymin) * g_dy + g_y0;
        bw = x_tick_dx * (1 - 2 * b_pad);
        bh = g_y1 - by;
        hovertext = `${labels[i]}: ${values[i]} +/- ${sems[i]}`;
        drawRect(svg, bx, by, x_tick_dx - 2 * b_pad * x_tick_dx, bh, fill_colors[i], box_stroke_width, colors[i], hovertext);
    }

    // Draw SEM bars
    for (let i = 0; i < values.length; i++) {
        y0 = (ymax - values[i] - sems[i]) / (ymax - ymin) * g_dy + g_y0;
        y1 = (ymax - values[i] + sems[i]) / (ymax - ymin) * g_dy + g_y0;
        x0 = x_tick_values[i] - x_tick_dx * sem_wid;
        x1 = x_tick_values[i] + x_tick_dx * sem_wid;
        drawLine(svg, x_tick_values[i], y0, x_tick_values[i], y1, false, colors[i], sem_stroke_width);
        drawLine(svg, x0, y0, x1, y0, false, colors[i], sem_stroke_width);
        drawLine(svg, x0, y1, x1, y1, false, colors[i], sem_stroke_width);
    }

    // X axis
    drawRect(svg, g_x0, g_y1, (g_x1-g_x0), 5, "#ffffff");
    drawLine(svg, g_x0, g_y1, g_x1, g_y1, true);

    // Y axis
    drawLine(svg, g_x0, g_y1, g_x0, g_y0, true);

    // Title
    draw_title(svg, width/2, 0, title);

}
