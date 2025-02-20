# name: discourse-custom-banner
# about: Adds custom banner settings to categories
# version: 0.1
# authors: Mentorfy
# url: https://github.com/mentorfy/mentorfy-custom-banner

enabled_site_setting :custom_banner_enabled

register_asset "stylesheets/common/custom-banner.scss"

after_initialize do
  module ::CustomBanner
    class Engine < ::Rails::Engine
      engine_name "custom_banner"
      isolate_namespace CustomBanner
    end
  end

  require_dependency "application_controller"
  require_dependency File.expand_path(
                       "../app/controllers/custom_banner/banner_controller.rb",
                       __FILE__,
                     )

  add_to_serializer(:category, :banner_url) { object.custom_fields["banner_url"] }
  add_to_serializer(:category, :include_banner_url?) { object.custom_fields["banner_url"].present? }

  Category.register_custom_field_type("banner_url", :string)
  Site.preloaded_category_custom_fields << "banner_url"

  CustomBanner::Engine.routes.draw do
    post "/:category_id/upload" => "banner#upload"
    delete "/:category_id" => "banner#destroy"
  end

  Discourse::Application.routes.append do
    mount ::CustomBanner::Engine, at: "/categories/:category_id/custom_banner"
  end
end
