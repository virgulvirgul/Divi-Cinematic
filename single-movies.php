<?php

get_header();
$is_page_builder_used = et_pb_is_pagebuilder_used( get_the_ID() );

?>

<div id="main-content">
	<div class="container">
		<div id="content-area" class="clearfix">

			<?php
				while ( have_posts() ) : the_post();
					$meta = get_post_meta(get_the_ID());
					$meta['genres'] = wp_get_post_terms(get_the_ID(), 'genre');
					$meta['ratings'] = wp_get_post_terms(get_the_ID(), 'rating');
					$meta['features'] = wp_get_post_terms(get_the_ID(), 'feature');
			?>

			<div class="white_popup_top" data-start="<?=$meta['start_date'][0]?>" data-end="<?=$meta['end_date'][0]?>">
				<div class="movie_poster">
					<?=get_the_post_thumbnail($post->ID, array(250, 370), array('class' => ''))?>
				</div>

				<div class="movie_details">
					<h2 style="margin-top:0;"><?php the_title(); ?></h2>
					<p class="post-meta">
						<?php if(!empty($meta['rating'][0])) { ?>
							<a href="http://www.consumerprotectionbc.ca/consumers-film-and-video-homepage/categoriesandadvisories" target="_blank" rel="external nofollow">
								<img src="<?=get_stylesheet_directory_uri().'/assets/images/ratings/'.$meta['rating'][0].'.png'?>" title="Rated <?=strtoupper($meta['rating'][0])?>: <?=$meta['rating_description'][0]?>" class="rating-image">
							</a>
							<?php } ?>
						<?php foreach($meta['genres'] as $genre) { echo $genre->name.' | '; }	?>
						<?php foreach($meta['features'] as $feature) { echo $feature->name.' | '; }	?>
						<?php if(isset($meta['website'][0]) && $meta['website_confirm'][0] != '') { echo '<a href="'.$meta['website'][0].'" target="_blank" title="Official Website" rel="nofollow external">Official Website</a>'; } ?>
					</p>

					<div class="movie_info">
						<?php
							$comma = (empty($meta['early'][0]) ? '' : ', ');
							echo '<div class="showtimes" style="background-color: '.et_get_option('secondary_nav_bg').'"><strong>Showtimes for: </strong>'.date('F j',$meta['start_date'][0]).' - '.date('F j',$meta['end_date'][0]).'</div>';
						?>
						<div>
							<?php
								if(!empty($meta['early'][0]) || !empty($meta['late'][0])) { echo '<strong>Nightly @ </strong>'.$meta['early'][0].$comma.$meta['late'][0].'<br>'; }
								if(!empty($meta['matinee'][0])) { echo '<strong>Weekend Matinees @ </strong>'.$meta['matinee'][0].'<br>'; }
								if(!empty($meta['special'][0])) { echo '<strong>Special Showing @ </strong>'.$meta['special'][0].'<br>'; }
								if(!empty($meta['runtime_minutes'][0])) { echo '<span class="runtime"><strong>Runtime: </strong>'.$meta['runtime_minutes'][0].' min</span><br>'; }
							?>
						</div>
						<?php if(!empty($meta['notes'][0])) { echo '<div class="showtimes" style="background-color:#333;">'.$meta['notes'][0].'</div>'; } ?>
					</div>
					<br>
					<?php if(!empty($meta['starring'][0])) { echo '<p><strong>Starring: </strong>'.$meta['starring'][0].'</p>'; } ?>
					<?php if(!empty($meta['description'][0])) { echo '<p><strong>Synopsis: </strong>'.$meta['description'][0].'</p>'; } ?>
				</div>
			</div>

			<?php if(isset($meta['trailer'][0]) && $meta['trailer_confirm'][0] != '') { ?>
			<div class="white_popup_bottom">
				<iframe width="900" height="400" src="<?=preg_replace("/\s*[a-zA-Z\/\/:\.]*youtube.com\/watch\?v=([a-zA-Z0-9\-_]+)([a-zA-Z0-9\/\*\-\_\?\&\;\%\=\.]*)/i","//www.youtube.com/embed/$1",$meta['trailer'][0])?>?rel=0&amp;autohide=2&amp;iv_load_policy=3&amp;modestbranding=1&amp;color=white" frameborder="0" allowfullscreen></iframe>
			</div>
			<?php } ?>
		</div>

		<?php
			// Clear $meta so it doesn't contaminate the other movie listings
			unset($meta);
			endwhile;
		?>
</div> <!-- #main-content -->

<?php get_footer(); ?>