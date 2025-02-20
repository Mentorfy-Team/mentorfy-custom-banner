import Component from "@glimmer/component";
import { action } from "@ember/object";
import { service } from "@ember/service";

export default class CategoryCustomBanner extends Component {
  @service siteSettings;

  get category() {
    return this.args.category;
  }

  @action
  async updateBannerTitle(event) {
    await this.category.saveCustomFields({
      custom_banner_title: event.target.value,
    });
  }

  @action
  async updateBannerDescription(event) {
    await this.category.saveCustomFields({
      custom_banner_description: event.target.value,
    });
  }
}
