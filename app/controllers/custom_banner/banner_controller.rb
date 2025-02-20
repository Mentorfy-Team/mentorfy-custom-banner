# frozen_string_literal: true

module CustomBanner
  class BannerController < ::ApplicationController
    requires_login
    skip_before_action :check_xhr
    before_action :ensure_logged_in
    before_action :ensure_staff

    def upload
      raise Discourse::InvalidParameters.new(:category_id) unless params[:category_id].present?

      category = ::Category.find_by(id: params[:category_id])
      raise Discourse::NotFound unless category

      raise Discourse::InvalidParameters.new(:file_url) unless params[:file_url].present?

      # A URL já foi gerada pelo UppyImageUploader
      category.custom_fields["banner_url"] = params[:file_url]
      category.save_custom_fields(true)

      render json: success_json
    end

    def destroy
      raise Discourse::InvalidParameters.new(:category_id) unless params[:category_id].present?

      category = ::Category.find_by(id: params[:category_id])
      raise Discourse::NotFound unless category

      category.custom_fields.delete("banner_url")
      category.save_custom_fields(true)

      render json: success_json
    end
  end
end
