#!/usr/bin/env python3
"""
Universal graph generator with e-ink styling
Usage: python3 generate_graph.py <config_file.json>
"""

import matplotlib.pyplot as plt
import numpy as np
import json
import sys
import os
from pathlib import Path

# Get script directory
SCRIPT_DIR = Path(__file__).parent
STYLE_FILE = SCRIPT_DIR / "graph_style.json"


class GraphStyle:
    """Manages e-ink graph styling"""

    def __init__(self, style_file=STYLE_FILE):
        with open(style_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.colors = data['colors']
        self.style = data['style']

    def get_color(self, color_name):
        """Get color hex code by name"""
        return self.colors.get(color_name, color_name)

    def apply_to_figure(self, fig, ax, minimal=False):
        """Apply e-ink styling to matplotlib figure and axes"""
        # Figure styling
        fig.patch.set_facecolor(self.get_color(self.style['figure']['facecolor']))

        # Axes styling
        ax.set_facecolor(self.get_color(self.style['axes']['facecolor']))

        if minimal:
            # Minimal mode: remove spines, ticks, grid
            ax.spines['top'].set_visible(False)
            ax.spines['right'].set_visible(False)
            ax.spines['bottom'].set_visible(False)
            ax.spines['left'].set_visible(False)
            ax.tick_params(
                left=False, bottom=False,
                labelleft=False, labelbottom=False
            )
            ax.grid(False)
        else:
            # Normal mode: style spines, ticks, grid
            ax.spines['bottom'].set_color(self.get_color(self.style['axes']['edgecolor']))
            ax.spines['left'].set_color(self.get_color(self.style['axes']['edgecolor']))
            ax.spines['top'].set_color(self.get_color(self.style['axes']['edgecolor']))
            ax.spines['right'].set_color(self.get_color(self.style['axes']['edgecolor']))

            # Tick colors
            ax.tick_params(
                colors=self.get_color(self.style['axes']['labelcolor']),
                labelsize=self.style['fonts']['tick_size']
            )

            # Grid
            ax.grid(
                True,
                alpha=self.style['axes']['grid_alpha'],
                linestyle=self.style['axes']['grid_linestyle'],
                linewidth=self.style['axes']['grid_linewidth'],
                color=self.get_color(self.style['axes']['grid_color'])
            )


class GraphGenerator:
    """Universal graph generator"""

    def __init__(self, config_file):
        with open(config_file, 'r', encoding='utf-8') as f:
            self.config = json.load(f)

        self.style = GraphStyle()
        self.fig = None
        self.ax = None

    def create_figure(self):
        """Create matplotlib figure with e-ink styling"""
        figsize = self.config.get('figsize', [10, 6])
        dpi = self.style.style['figure']['dpi']
        minimal = self.config.get('minimal', False)

        self.fig, self.ax = plt.subplots(figsize=figsize, dpi=dpi)
        self.style.apply_to_figure(self.fig, self.ax, minimal=minimal)

    def plot_function(self, func_str, var, x_range, **kwargs):
        """Plot a mathematical function"""
        x = np.linspace(x_range[0], x_range[1], 500)

        # Create safe evaluation environment
        safe_dict = {
            'np': np,
            'sin': np.sin,
            'cos': np.cos,
            'tan': np.tan,
            'sqrt': np.sqrt,
            'exp': np.exp,
            'log': np.log,
            'abs': np.abs,
            var: x
        }

        y = eval(func_str, {"__builtins__": {}}, safe_dict)

        color = self.style.get_color(kwargs.get('color', self.style.style['lines']['primary_color']))
        linewidth = kwargs.get('linewidth', self.style.style['lines']['linewidth'])
        label = kwargs.get('label', None)

        self.ax.plot(x, y, color=color, linewidth=linewidth, label=label)

        return x, y

    def add_roots(self, roots, **kwargs):
        """Add root markers to the plot"""
        marker_style = self.style.style['markers']
        color = self.style.get_color(kwargs.get('color', marker_style['color']))
        size = kwargs.get('size', marker_style['size'])
        edge_color = self.style.get_color(kwargs.get('edge_color', marker_style['edge_color']))
        edge_width = kwargs.get('edge_width', marker_style['edge_width'])
        label = kwargs.get('label', 'Miejsca zerowe')

        self.ax.plot(
            roots, [0] * len(roots), 'o',
            color=color,
            markersize=size,
            markeredgecolor=edge_color,
            markeredgewidth=edge_width,
            label=label,
            zorder=5
        )

    def fill_region(self, x_range, func_str, var, y_comparison=0, direction='below', **kwargs):
        """Fill region above/below function"""
        x = np.linspace(x_range[0], x_range[1], 500)

        safe_dict = {
            'np': np,
            'sin': np.sin,
            'cos': np.cos,
            'tan': np.tan,
            'sqrt': np.sqrt,
            'exp': np.exp,
            'log': np.log,
            'abs': np.abs,
            var: x
        }

        y = eval(func_str, {"__builtins__": {}}, safe_dict)

        fill_style = self.style.style['fill']

        if direction == 'below':
            color = self.style.get_color(kwargs.get('color', fill_style['negative_color']))
        else:
            color = self.style.get_color(kwargs.get('color', fill_style['positive_color']))

        alpha = kwargs.get('alpha', fill_style['alpha'])
        label = kwargs.get('label', None)

        self.ax.fill_between(x, y, y_comparison, alpha=alpha, color=color, label=label)

    def add_annotation(self, xy, text, xytext=None, **kwargs):
        """Add annotation with arrow"""
        ann_style = self.style.style['annotations']

        if xytext is None:
            xytext = xy

        fontsize = kwargs.get('fontsize', self.style.style['fonts']['annotation_size'])
        color = self.style.get_color(kwargs.get('color', ann_style['color']))
        arrow_color = self.style.get_color(kwargs.get('arrow_color', ann_style['arrow_color']))
        ha = kwargs.get('ha', 'center')

        bbox_props = dict(
            boxstyle='round,pad=0.5',
            facecolor=self.style.get_color(ann_style['box_facecolor']),
            edgecolor=self.style.get_color(ann_style['box_edgecolor']),
            alpha=ann_style['box_alpha']
        )

        if xy != xytext:
            arrowprops = dict(
                arrowstyle='->',
                color=arrow_color,
                lw=1.5
            )
        else:
            arrowprops = None
            bbox_props = None

        self.ax.annotate(
            text, xy=xy, xytext=xytext,
            fontsize=fontsize, ha=ha, color=color,
            bbox=bbox_props,
            arrowprops=arrowprops
        )

    def add_vertex(self, x, y, **kwargs):
        """Add vertex marker to the plot"""
        marker_style = self.style.style['markers']
        color = self.style.get_color(kwargs.get('color', 'orange'))
        size = kwargs.get('size', marker_style['size'] * 1.5)
        edge_color = self.style.get_color(kwargs.get('edge_color', marker_style['edge_color']))
        edge_width = kwargs.get('edge_width', marker_style['edge_width'])
        label = kwargs.get('label', None)

        self.ax.plot(
            [x], [y], 'o',
            color=color,
            markersize=size,
            markeredgecolor=edge_color,
            markeredgewidth=edge_width,
            label=label,
            zorder=10
        )

    def add_arrow_annotation(self, xy, direction='up', **kwargs):
        """Add arrow with text showing direction"""
        text = kwargs.get('text', '')
        offset = kwargs.get('offset', 15)
        color = self.style.get_color(kwargs.get('color', 'orange'))

        # Calculate arrow end point based on direction
        if direction == 'up':
            xytext = (xy[0], xy[1] + offset)
            arrow_style = '->'
        elif direction == 'down':
            xytext = (xy[0], xy[1] - offset)
            arrow_style = '->'
        elif direction == 'left':
            xytext = (xy[0] - offset, xy[1])
            arrow_style = '->'
        elif direction == 'right':
            xytext = (xy[0] + offset, xy[1])
            arrow_style = '->'
        else:
            xytext = xy
            arrow_style = '->'

        arrowprops = dict(
            arrowstyle=arrow_style,
            color=color,
            lw=2.5,
            mutation_scale=20
        )

        self.ax.annotate(
            text, xy=xy, xytext=xytext,
            fontsize=kwargs.get('fontsize', 12),
            ha='center', va='center',
            color=color,
            arrowprops=arrowprops,
            fontweight='bold'
        )

    def add_axes_lines(self):
        """Add x=0 and y=0 axes lines"""
        minimal = self.config.get('minimal', False)
        if minimal:
            # In minimal mode, use subtle stone-300 color for axes
            axis_color = self.style.get_color('stone_300')
            self.ax.axhline(y=0, color=axis_color, linestyle='-', linewidth=1, alpha=0.4)
            self.ax.axvline(x=0, color=axis_color, linestyle='-', linewidth=1, alpha=0.4)
        else:
            axis_color = self.style.get_color(self.style.style['axes']['edgecolor'])
            self.ax.axhline(y=0, color=axis_color, linestyle='-', linewidth=0.8, alpha=0.7)
            self.ax.axvline(x=0, color=axis_color, linestyle='-', linewidth=0.8, alpha=0.7)

    def set_labels(self, xlabel=None, ylabel=None, title=None):
        """Set axis labels and title"""
        font_style = self.style.style['fonts']
        label_color = self.style.get_color(self.style.style['axes']['labelcolor'])
        title_color = self.style.get_color(self.style.style['axes']['titlecolor'])

        if xlabel:
            self.ax.set_xlabel(xlabel, fontsize=font_style['label_size'],
                             fontweight=font_style['weight'], color=label_color)
        if ylabel:
            self.ax.set_ylabel(ylabel, fontsize=font_style['label_size'],
                             fontweight=font_style['weight'], color=label_color)
        if title:
            self.ax.set_title(title, fontsize=font_style['title_size'],
                            fontweight='bold', color=title_color, pad=20)

    def set_limits(self, xlim=None, ylim=None):
        """Set axis limits"""
        if xlim:
            self.ax.set_xlim(xlim)
        if ylim:
            self.ax.set_ylim(ylim)

    def add_legend(self, **kwargs):
        """Add legend with e-ink styling"""
        legend_style = self.style.style['legend']

        self.ax.legend(
            loc=kwargs.get('loc', 'upper right'),
            fontsize=legend_style['fontsize'],
            framealpha=legend_style['framealpha'],
            facecolor=self.style.get_color(legend_style['facecolor']),
            edgecolor=self.style.get_color(legend_style['edgecolor'])
        )

    def save(self, output_path):
        """Save figure to file"""
        plt.tight_layout()
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        self.fig.savefig(
            output_path,
            dpi=self.style.style['figure']['dpi'],
            bbox_inches='tight',
            facecolor=self.style.get_color(self.style.style['figure']['facecolor']),
            edgecolor='none'
        )
        plt.close(self.fig)

    def generate_quadratic(self):
        """Generate quadratic function graph"""
        config = self.config

        # Create figure
        self.create_figure()

        # Plot main function
        func_str = config['function']
        var = config['variable']
        x_range = config['x_range']

        self.plot_function(
            func_str, var, x_range,
            label=config.get('function_label', f'$y = {func_str.replace("**", "^")}$')
        )

        # Add roots if specified
        if 'roots' in config:
            self.add_roots(config['roots'])

        # Fill regions if specified
        if config.get('fill_negative'):
            roots = config['roots']
            self.fill_region(
                [roots[0], roots[1]], func_str, var,
                label=config.get('negative_label', 'Obszar ujemny')
            )

        # Add axes lines
        self.add_axes_lines()

        # Add vertex if specified
        if 'vertex' in config:
            vertex = config['vertex']
            self.add_vertex(vertex['x'], vertex['y'], **vertex.get('kwargs', {}))

        # Add arrows if specified
        if 'arrows' in config:
            for arrow in config['arrows']:
                self.add_arrow_annotation(
                    xy=arrow['xy'],
                    direction=arrow['direction'],
                    **arrow.get('kwargs', {})
                )

        # Add annotations
        if 'annotations' in config:
            for ann in config['annotations']:
                self.add_annotation(
                    xy=ann['xy'],
                    text=ann['text'],
                    xytext=ann.get('xytext'),
                    **ann.get('kwargs', {})
                )

        # Set labels
        self.set_labels(
            xlabel=config.get('xlabel'),
            ylabel=config.get('ylabel'),
            title=config.get('title')
        )

        # Set limits
        self.set_limits(
            xlim=config.get('xlim'),
            ylim=config.get('ylim')
        )

        # Add legend
        if config.get('show_legend', True):
            self.add_legend()

    def generate_comparison(self):
        """Generate comparison graph with multiple functions"""
        config = self.config

        # Create figure
        self.create_figure()

        # Plot all functions
        functions = config['functions']
        var = config['variable']
        x_range = config['x_range']

        for func in functions:
            func_str = func['function']
            label = func.get('label', func_str)
            color = func.get('color', 'orange')
            linestyle = func.get('linestyle', '-')
            linewidth = func.get('linewidth', self.style.style['lines']['linewidth'])

            self.plot_function(
                func_str, var, x_range,
                label=label,
                color=color,
                linewidth=linewidth
            )

        # Add axes lines
        self.add_axes_lines()

        # Add vertex markers if specified
        if 'vertices' in config:
            for vertex in config['vertices']:
                self.add_vertex(vertex['x'], vertex['y'], **vertex.get('kwargs', {}))

        # Add annotations if specified
        if 'annotations' in config:
            for ann in config['annotations']:
                self.add_annotation(
                    xy=ann['xy'],
                    text=ann['text'],
                    xytext=ann.get('xytext'),
                    **ann.get('kwargs', {})
                )

        # Set labels
        self.set_labels(
            xlabel=config.get('xlabel'),
            ylabel=config.get('ylabel'),
            title=config.get('title')
        )

        # Set limits
        self.set_limits(
            xlim=config.get('xlim'),
            ylim=config.get('ylim')
        )

        # Add legend
        if config.get('show_legend', True):
            self.add_legend(loc=config.get('legend_loc', 'best'))

    def generate(self):
        """Main generation method - routes to specific type"""
        graph_type = self.config.get('type', 'quadratic')

        if graph_type == 'quadratic':
            self.generate_quadratic()
        elif graph_type == 'comparison':
            self.generate_comparison()
        else:
            raise ValueError(f"Unsupported graph type: {graph_type}")

        # Save
        output_path = self.config['output']
        self.save(output_path)
        print(f"✓ Graph saved to: {output_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 generate_graph.py <config_file.json>")
        sys.exit(1)

    config_file = sys.argv[1]

    if not os.path.exists(config_file):
        print(f"Error: Config file not found: {config_file}")
        sys.exit(1)

    generator = GraphGenerator(config_file)
    generator.generate()


if __name__ == "__main__":
    main()