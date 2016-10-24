jQuery(document).ready(function($){

	function sleep(time) {
		return new Promise((resolve) => setTimeout(resolve, time));
	}

	function set_status_light(state, colour, text, description, is_link) {
		if (state === 0) {
			$('#api_spinner').removeClass('status-light').css({ 'visibility':'visible','background-color':'' });
		} else {
			$('#api_spinner').addClass('status-light').css('visibility','visible');
			$('.status-light').css('background-color',colour);
		}
		if (is_link) {
			$('#api_status').replaceWith('<a id="api_status" href="https://www.themoviedb.org/search?query=' + encodeURIComponent($('#title').val()) + '" target="_blank" title="Search TMDB\'s website">' + text +'</a>');
		} else {
			$('#api_status').replaceWith('<span id="api_status" title="' + description + '">' + text +'</span>');
		}
	}

	function toggle_fetch_button(state) {
		if (state === 0) {
			$('#load_movie').text('Continue').addClass('continue-fetch');
			$('#publish').addClass('button-disabled');
		} else {
			$('#load_movie').text('Fetch Movie Details').removeClass('continue-fetch');
			$('#publish').removeClass('button-disabled');
		}
	}

	function validate_response(response) {
	  try {
	    var json = JSON.parse(response);
	    if (json && typeof json === "object") {
				if (json.status_code) {
					alert(json.status_message);
				}
				if (json.length < 1) {
					return false;
				}
				return json;
	    }
	  }
	  catch (e) { }
	  return false;
	};

	function submit_movie(tmdb) {
		set_status_light(0, '', 'Fetching...', '', false);
		var dataMovie = {
	    action: 'movie_fetch',
	    id: $('#post_id').val(),
      tmdb: tmdb
		};
		$.post(ajaxurl, dataMovie, function(response) {
			var json = validate_response(response);
			if (json) {
				var genres = json.movie.genres ? json.movie.genres : [''];
				var title  = json.movie.title ? json.movie.title : '';
				// Save the response (the string of genres) to a hidden input.
				// If we don't do this they get overwritten when we save because
				// the checkboxes are all unchecked.
				$('input[name="genres"]').val(genres.join(','));
				// Update the title to the official movie format / spelling
				$('#title').val(title);
				// Save and reload the page.
				$('#save-post').click();
			} else {
				set_status_light(1, '#F44336', 'No results', '', true);
			}
		});
	}

	// Turn the status light into a spinner
	$('#api_spinner').addClass('status-light').css('visibility','visible');
	// Check the status of our movie API
	$.post(ajaxurl, {'action': 'movie_api_status'}, function(response) {
		if(response && response === 'online') {
		  set_status_light(1, '#8BC34A', 'API is online', '', false);
		} else {
		  set_status_light(1, '#F44336', 'API is offline', '', false);
		}
	});

	// Load the movie details via AJAX call
	$('#load_movie').click(function(e) {
		e.preventDefault(); // Prevent the link from doing it's thing
		if ($(this).hasClass('continue-fetch')) {
			submit_movie($("input:radio[name='suggestions']:checked").val());
		} else {
			$('#movie-suggestions').remove();
		  set_status_light(0, '', 'Searching...', '', false);
			$('input[name=fetched]').val(1)
			// Function to call, post ID, and post title
			var dataMovie = {
		    action: 'movie_suggestions',
		    id: $('#post_id').val(),
	      title: $('#title').val()
			};
			$.post(ajaxurl, dataMovie, function(response) {
				var json = validate_response(response);
				if (json && json.length > 1) {
					var suggestions = '<div class="categorydiv" id="movie-suggestions"><p>Multiple matches found. Please make a selection and press Continue.</p><div class="tabs-panel">';
					$.each(json, function(i, item) {
						console.log(json[i]);
					  suggestions += '<label><input value="' + json[i].id + '" type="radio" name="suggestions" ' + (i == 0 ? 'checked="checked"' : '') + '><strong>' + json[i].year + ':</strong> ' + json[i].title + '</label>';
					})
					suggestions += '</div></div>';
					$('.fetch-details').append(suggestions);
					set_status_light(1, '#FFC107', json.length + ' matches', '', false);
					toggle_fetch_button(0);
				} else if (json.status_code) {
					set_status_light(1, '#F44336', 'Error: ' + json.status_code, json.status_message, false);
				} else if (!json) {
					set_status_light(1, '#F44336', 'No results', '', true);
				} else {
					submit_movie(json[0].id);
				}
			});
		}
	});

	// Confirm film rating via AJAX
  // This scrapes the Consumer Protection BC website to grab the first result
  // It's pretty ghetto, so we need to make sure it degrades gracefully
	$('#rating-confirm').click(function(e) {
		e.preventDefault(); // Prevent the link from doing it's thing
		$('#rating-spinner').css('visibility','visible');
		var dataRating = {
	    action: 'movie_confirm_film_rating',
      title: $('#title').val()
		};
  	$.post(ajaxurl, dataRating, function(response) {
      $('#rating-spinner').css('visibility','hidden');
      if(response) {
        // Find the second cell on the second row of the second table (I know, right?!)
        var found = $('.searchlicense:eq(2) tr:nth-child(2) td:nth-child(2)', $(response)).html();
        // Update the response message
        $('#rating-response span').html('Response received as: ' + found + '. ');
        // Add the classes and show the message
        // We add the classes with javascript because if we don't WordPress
        // will move it to the top of the page
        $('#rating-response').addClass('notice notice-success').show();
        // If `found` returns null we need to forward the user to the page
        if (!found) {
          $('#rating-response span').html('No response received. ');
          $('#rating-response').addClass('notice notice-error').show();
        }
  		} else {
        $('#rating-response span').html('No response received. ');
        $('#rating-response').addClass('notice notice-error').show();
  		}
  	});
	});

	// Prettify the JSON response data if there is any
	var response = $('#movie_response .inside').html();
	if ($.trim(response) !== 'No response data.') {
		$('#movie_response .inside').JSONView(response, { collapsed: true });
	}

	// Initialize the lazy YouTube embed
	$('#trailer-frame').lazyYT();

	// Create and destroy the website iFrame when the postbox is open / closed
  $('#website-postbox .postbox').click(function(e) {
		if ($(this).hasClass('closed')) {
			$('#website-frame').attr('src', null);
		} else {
			var src = $('input[name=website]').val();
			$('#website-frame').attr('src', src);
		}
  });
});
