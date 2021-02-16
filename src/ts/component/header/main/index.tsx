import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon } from 'ts/component';
import { I, DataUtil, SmileUtil, Util } from 'ts/lib';
import { commonStore, blockStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends RouteComponentProps<any>  {};

@observer
class HeaderMainIndex extends React.Component<Props, {}> {
	
	constructor (props: any) {
		super(props);
		
		this.onAdd = this.onAdd.bind(this);
		this.onSettings = this.onSettings.bind(this);
		this.onSearch = this.onSearch.bind(this);
	};

	render () {
		return (
			<div className="header headerMainIndex">
				<div className="side center" onClick={this.onSearch}>Search for an object</div>

				<div className="side right">
					<Icon tooltip="Settings" className={[ 'settings', (commonStore.popupIsOpen('settings') ? 'active' : '') ].join(' ')} onClick={this.onSettings} />
				</div>
			</div>
		);
	};

	onSearch (e: any) {
		const { root } = blockStore;

		commonStore.popupOpen('search', { 
			preventResize: true,
			data: { 
				type: I.NavigationType.Go, 
				disableFirstKey: true,
				rootId: root,
			}, 
		});
	};

	onAdd (e: any) {
		const { root } = blockStore;
		
		DataUtil.pageCreate(e, root, '', { iconEmoji: SmileUtil.random() }, I.BlockPosition.Bottom, (message: any) => {
			DataUtil.pageOpen(message.targetId);
			Util.scrollTopEnd();
		});
	};

	onSettings (e: any) {
		commonStore.popupOpen('settings', {});
	};

};

export default HeaderMainIndex;