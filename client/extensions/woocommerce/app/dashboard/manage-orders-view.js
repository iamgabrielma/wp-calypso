/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getNewOrders,
	getNewOrdersRevenue,
} from 'woocommerce/state/sites/orders/selectors';
import { fetchSettingsGeneral } from 'woocommerce/state/sites/settings/general/actions';
import { getCurrentUser } from 'state/current-user/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import ProcessOrdersWidget from 'woocommerce/components/process-orders-widget';
import ReadingWidget from 'woocommerce/components/reading-widget';
import ShareWidget from 'woocommerce/components/share-widget';

class ManageOrdersView extends Component {
	static propTypes = {
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
			URL: PropTypes.string.isRequired,
		} ),
		fetchOrders: PropTypes.func,
		fetchSettingsGeneral: PropTypes.func,
		currency: PropTypes.shape( {
			value: PropTypes.string,
		} ),
		orders: PropTypes.array,
		ordersRevenue: PropTypes.number,
		ordersLoading: PropTypes.bool,
		ordersLoaded: PropTypes.bool,
		user: PropTypes.shape( {
			display_name: PropTypes.string,
			username: PropTypes.string.isRequired,
		} ),
	};

	componentDidMount() {
		const { site } = this.props;

		if ( site && site.ID ) {
			this.props.fetchOrders( site.ID );
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = newProps.site ? newProps.site.ID : null;
		const oldSiteId = site ? site.ID : null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchOrders( newProps.siteId );
			this.props.fetchSettingsGeneral( site.ID );
		}
	}

	possiblyrenderProcessOrdersWidget = () => {
		const { site, orders, ordersRevenue, currency } = this.props;
		if ( ! orders.length ) {
			return null;
		}
		return (
			<ProcessOrdersWidget
				className="dashboard__process-orders-widget"
				site={ site }
				orders={ orders }
				ordersRevenue={ ordersRevenue }
				currency={ currency }
			/>
		);
	}

	possiblyRenderShareWidget = () => {
		// TODO - connect to display preferences in a follow-on PR
		const { site, translate } = this.props;
		return (
			<ShareWidget
				text={ translate( 'Share a link to your store on social media.' ) }
				title={ translate( 'Share your store' ) }
				urlToShare={ site.URL }
			/>
		);
	}

	possiblyRenderReadingWidget = () => {
		// TODO - connect to display preferences in a follow-on PR
		const { translate } = this.props;
		return (
			<ReadingWidget
				text={ translate( 'You’re not alone! Get tips from seasoned merchants,' +
					' learn best practices to keep your store ship-shape,' +
					' and find how to boost your sales and drive traffic.' ) }
				title={ translate( 'Recommended reading' ) }
			/>
		);
	}

	render = () => {
		const { site, translate, orders, user } = this.props;
		return (
			<div className="dashboard__manage-has-orders">
				<div className="dashboard__manage-has-orders-header">
					<h2>
						{ translate( 'Welcome back, {{storeOwnerName/}}.', {
							components: {
								storeOwnerName: <strong>{ user.display_name || user.username }</strong>
							}
						} ) }
						{ orders.length && (
							<span>{ translate( 'You have new orders to process 🎉' ) }</span>
						) || '' }
					</h2>
				</div>
				{ this.possiblyrenderProcessOrdersWidget() }
				<div className="dashboard__manage-has-orders-stats-actions">
					<Button href={ getLink( '/store/stats/orders/day/:site', site ) }>
						{ orders.length ? translate( 'View full reports' ) : translate( 'View reports' ) }
					</Button>
				</div>
				{ this.possiblyRenderShareWidget() }
				{ this.possiblyRenderReadingWidget() }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const ordersLoading = areOrdersLoading( state );
	const ordersLoaded = areOrdersLoaded( state );
	const orders = getNewOrders( state );
	const ordersRevenue = getNewOrdersRevenue( state );
	const user = getCurrentUser( state );
	const currency = getPaymentCurrencySettings( state );
	return {
		site,
		orders,
		ordersRevenue,
		ordersLoading,
		ordersLoaded,
		user,
		currency,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchOrders,
			fetchSettingsGeneral,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )( localize( ManageOrdersView ) );
