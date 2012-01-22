function clippy(color) {
    var bg = (color.luma <= 0.25) ? 'CCCCCC' : '1A1A1A';
    
    return '<div class="clippy"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="110" height="14" id="clippy"><param name="movie" value="/palette/assets/flash/clippy.swf"><param name="allowScriptAccess" value="always"><param name="quality" value="high"><param name="scale" value="noscale"><param name="FlashVars" value="text=' + color.hex + '"><param name="bgcolor" value="#' + bg + '"><param name="wmode" value="opaque"><embed src="/palette/assets/flash/clippy.swf" width="110" height="14" name="clippy" quality="high" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" FlashVars="text=' + color.hex + '" bgcolor="#' + bg + '" wmode="opaque"></object></div>';
}

function hsv_to_object(string) {
    var hsv = string.split(',');
    
    return {
        'h': parseFloat(hsv[0]),
        's': parseFloat(hsv[1]),
        'v': parseFloat(hsv[2])
    };
}

function hsv_to_string(hsv) {
    return hsv.h.toString() + ',' + hsv.s.toString() + ',' + hsv.v.toString();
}

function resize(size) {
    var integer = parseInt(size, 10);
    
    $.palette.hide();
    
    $('#palette > div').css({
        'width': size + 'px',
        'height': size + 'px'
    });
    
    $('#palette').css({
        'width': (integer * 6).toString() + 'px',
        'height': (integer * 4).toString() + 'px'
    });
}

$(document).ready(function() {
    var
        $body = $('body'),
        $hover = false,
        
        palette = def = ['0,0,0', '0,0,4', '0,0,8', '0,0,12', '0,0,16', '0,0,20', '0,0,44', '0,0,40', '0,0,36', '0,0,32', '0,0,28', '0,0,24', '0,0,48', '0,0,52', '0,0,56', '0,0,60', '0,0,64', '0,0,68', '0,0,92', '0,0,88', '0,0,84', '0,0,80', '0,0,76', '0,0,72', '120', 'false'];
    
    if ($.cookie('palette')) {
        palette = $.cookie('palette').split(';');
    } else {
        $.cookie('palette', palette.join(';'), {'expires': 7});
    }
    
    if (palette[palette.length - 1] == 'true') {
        $body.addClass('light');
    }
    
    resize(palette[palette.length - 2]);
    
    $('#palette > div').each(function(i) {
        var
            $this = $(this),
            
            color = parse_color(hsv_to_object(palette[i]));
        
        $this.html('<p/>');
        $this.palette({
            'color': color.hsv,
            'onChange': function($palette) {
                this.parent.children('p').html('#' + this.color.hex).toggleClass('light', this.color.luma <= 0.25);
                
                palette[this.parent.index()] = hsv_to_string(this.color.hsv);
                $.cookie('palette', palette.join(';'), {'expires': 7});
                
                this.parent.children('.clippy').remove();
                this.parent.append(clippy(this.color));
                this.parent.toggleClass('light', this.color.luma <= 0.25);
                this.parent.css('background-color', '#' + this.color.hex);
            },
            'onLive': function($palette) {
                this.parent.css('background-color', '#' + this.color.hex);
            }
        });
    }).mouseenter(function() {
        $hover = $(this);
    }).mouseleave(function() {
        $hover = false;
    });
    
    $('#palette').sortable({
        'cancel': '.clippy',
        'placeholder': 'highlight',
        'start': function(e, ui) {
            ui.placeholder.css({
                'width': $('#palette > div:first').css('width'),
                'height': $('#palette > div:first').css('height')
            });
        },
        'stop': function(e, ui) {
            $('#palette > div').each(function(i) {
                palette[i] = hsv_to_string($(this).data('palette').palette.data('palette').color.hsv);
            });
            
            $.cookie('palette', palette.join(';'), {'expires': 7});
        }
    });
    $('#palette p').draggable({revert: true});
    $('#palette > div').droppable({
        'tolerance': 'fit',
        'drop': function(e, ui) {
            $.palette.color($(this).data('palette').palette, ui.draggable.text(), 'drop');
        }
    });
    
    $('#dark').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            if ($body.hasClass('light')) {
                $body.removeClass('light');
                
                palette[palette.length - 1] = 'false';
                
                $.cookie('palette', palette.join(';'), {'expires': 7});
            }
        }
    });
    
    $('#light').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            if (!$body.hasClass('light')) {
                $body.addClass('light');
                
                palette[palette.length - 1] = 'true';
                
                $.cookie('palette', palette.join(';'), {'expires': 7});
            }
        }
    });
    
    $('#smaller').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            var size = $('#palette > div:first').width();
            
            if (size > 100) {
                size -= 10;
                
                palette[palette.length - 2] = size.toString();
                resize(size);
                
                $.cookie('palette', palette.join(';'), {'expires': 7});
            }
        }
    });
    
    $('#larger').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            var size = $('#palette > div:first').width();
            
            if (size < 150) {
                size += 10;
                
                palette[palette.length - 2] = size.toString();
                resize(size);
                
                $.cookie('palette', palette.join(';'), {'expires': 7});
            }
        }
    });
    
    $('#reset').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            $.extend(palette, def);
            
            if ($body.hasClass('light')) {
                $body.removeClass('light');
            }
            
            $('#palette > div').each(function(i) {
                $.palette.color($(this).data('palette').palette, hsv_to_object(palette[i]));
            });
            
            resize(palette[palette.length - 2]);
            
            $.cookie('palette', palette.join(';'), {'expires': 7});
        }
    });
    
    $('#colors').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            $.extend(palette, def.slice(0, -2));
            
            $('#palette > div').each(function(i) {
                $.palette.color($(this).data('palette').palette, hsv_to_object(palette[i]));
            });
            
            $.cookie('palette', palette.join(';'), {'expires': 7});
        }
    });
    
    $('#size').mousedown(function(e) {
        if (!(e.which > 1 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            e.preventDefault();
            
            var i = def.length - 2;
            
            palette[i] = def[i];
            
            resize(palette[i]);
            
            $.cookie('palette', palette.join(';'), {'expires': 7});
        }
    });
    
    $(document).keydown(function(e) {
        if (e.which == 51 && e.shiftKey && $hover) {
            e.preventDefault();
            
            $hover.trigger('click.palette');
            $hover.data('palette').palette.find('.palette_hex input').focus().select();
        }
    });
});
