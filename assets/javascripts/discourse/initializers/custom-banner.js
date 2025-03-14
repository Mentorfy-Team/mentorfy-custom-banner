import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { withPluginApi } from "discourse/lib/plugin-api";

export default {
  name: "custom-banner",
  initialize() {
    console.log("[CustomBanner] Initializing plugin...");

    withPluginApi("0.8.31", (api) => {
      console.log("[CustomBanner] Registering connectors...");

      api.registerConnectorClass("category-custom-settings", "custom-banner", {
        tagName: "div",
        classNames: ["category-custom-banner-settings"],
        categoryData: null,

        init() {
          this._super(...arguments);
          this.set("categoryData", this.args.category);
          console.log(
            "[CustomBanner] Settings connector initialized with category:",
            this.args.category
          );
        },

        actions: {
          async uploadBanner(upload) {
            try {
              const category = this.category;
              if (!category) {
                throw new Error("Categoria não encontrada");
              }

              console.log(
                "[CustomBanner] Uploading banner for category:",
                category.id,
                "URL:",
                upload.url
              );

              await ajax(
                `/categories/${category.id}/custom_banner/${category.id}/upload`,
                {
                  type: "POST",
                  data: {
                    file_url: upload.url,
                  },
                }
              );

              console.log(
                "[CustomBanner] Upload successful, updating category model"
              );

              // Atualiza o modelo da categoria com a nova URL
              category.set("custom_fields.banner_url", upload.url);

              // Força a atualização da view
              this.set("refreshing", true);
              this.set("refreshing", false);

              console.log(
                "[CustomBanner] Category model updated with banner URL"
              );
            } catch (error) {
              console.error("[CustomBanner] Error uploading banner:", error);
              popupAjaxError(error);
            }
          },

          async updateBannerDescription(event) {
            try {
              const category = this.category;
              if (!category) {
                throw new Error("Categoria não encontrada");
              }

              console.log(
                "[CustomBanner] Updating banner description for category:",
                category.id,
                "Text:",
                event.target.value
              );

              // Atualiza o modelo da categoria com a descrição
              category.set("custom_fields.banner_description", event.target.value);
              
              // Salva o campo personalizado
              await category.save();

              console.log(
                "[CustomBanner] Description updated successfully for category model"
              );
            } catch (error) {
              console.error("[CustomBanner] Error updating banner description:", error);
              popupAjaxError(error);
            }
          },

          async removeBanner() {
            try {
              const category = this.category;
              if (!category) {
                throw new Error("Categoria não encontrada");
              }

              console.log(
                "[CustomBanner] Removing banner for category:",
                category.id
              );

              await ajax(
                `/categories/${category.id}/custom_banner/${category.id}`,
                {
                  type: "DELETE",
                }
              );

              console.log(
                "[CustomBanner] Banner removal successful, updating category model"
              );

              // Remove a URL do banner do modelo
              category.set("custom_fields.banner_url", null);

              // Força a atualização da view
              this.set("refreshing", true);
              this.set("refreshing", false);

              console.log(
                "[CustomBanner] Category model updated after banner removal"
              );
            } catch (error) {
              console.error("[CustomBanner] Error removing banner:", error);
              popupAjaxError(error);
            }
          },
        },
      });

      api.registerConnectorClass("before-topic-list", "category-banner", {
        tagName: "div",
        classNames: ["category-banner-container"],

        init() {
          this._super(...arguments);
          console.log(
            "[CustomBanner] Banner connector initialized with args:",
            this.args,
            "outletArgs:",
            this.outletArgs
          );
        },

        shouldRender(args) {
          const shouldRender = args.category?.custom_fields?.banner_url;
          console.log("[CustomBanner] Checking if banner should render:", {
            categoryId: args.category?.id,
            customFieldsBannerUrl: args.category?.custom_fields?.banner_url,
            shouldRender,
          });
          return shouldRender;
        },
      });

      console.log("[CustomBanner] Plugin initialization complete");
    });
  },
};
