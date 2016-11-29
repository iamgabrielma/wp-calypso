/**
 * External Dependencies
 */
import React from 'react';
import { map, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import PostStore from 'lib/feed-post-store';
import Gridicon from 'components/gridicon';
import * as stats from 'reader/stats';

export class RecommendedPosts extends React.PureComponent {
	state = {
		posts: map( this.props.recommendations, PostStore.get.bind( PostStore ) )
	}

	updatePosts = ( props = this.props ) => {
		const posts = map( props.recommendations, PostStore.get.bind( PostStore ) );
		if ( some( posts, ( post, i ) => post !== this.state.posts[ i ] ) ) {
			this.setState( { posts } );
		}
	}

	handlePostClick = ( post ) => {
		stats.recordTrackForPost( 'calypso_reader_in_stream_rec_post_clicked', post );
		stats.recordAction( 'in_stream_rec_post_click' );
	}

	handleSiteClick = ( post ) => {
		stats.recordTrackForPost( 'calypso_reader_in_stream_rec_site_clicked', post );
		stats.recordAction( 'in_stream_rec_site_click' );
	}

	componentWillMount() {
		PostStore.on( 'change', this.updatePosts );
	}

	componentWillReceiveProps( nextProps ) {
		this.updatePosts( nextProps );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updatePosts );
	}

	render() {
		return (
			<div className="reader-stream__recommended-posts">
				<h5 className="reader-stream__recommended-posts-header"><Gridicon icon="star" />&nbsp;{ this.props.translate( 'Recommended Posts' ) }</h5>
				<div className="reader-stream__recommended-posts-posts">
					{
						map(
							this.state.posts,
							post => <RelatedPostCard key={ post.global_ID } post={ post } onPostClick={ this.handlePostClick } onSiteClick={ this.handleSiteClick } />
						)
					}
				</div>
			</div>
		);
	}
}

export default localize( RecommendedPosts );
