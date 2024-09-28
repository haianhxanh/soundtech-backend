import express from "express";
import { get_data } from "../controller/get_data.controller";
import { specs } from "../controller/specs.controller";
import { variants_vendor_sku } from "../controller/variants-vendor-sku.controller";
import { variants_weight_coo } from "../controller/variants-inventory-weight-coo.controller";
import { variants_dimensions } from "../controller/variants-vendor-dimensions.controller";
import { product_import } from "../controller/product-import.controller";
import { product_import_with_variants } from "../controller/product-import-with-variants.controller";
import { variant_update } from "../controller/variant-update.controller";
import { product_update } from "../controller/product-update.controller";
import { product_update_tags } from "../controller/product-update-tags.controller";
import { tags_add } from "../controller/tags-add.controller";
import { transfers } from "../controller/transfers.controller";
import { transfer_invoice } from "../controller/transfer-invoice.controller";
import { product_tags_add } from "../controller/product-tags-add.controller";

const router = express.Router();

router.get("/data", get_data);
router.get("/specs", specs);
router.get("/variants/vendor-sku", variants_vendor_sku);
router.get("/variants/weight-coo", variants_weight_coo);
router.get("/variants/dimensions", variants_dimensions);
router.get("/variants/update", variant_update);
router.get("/products/update", product_update);
router.get("/products/update/tags", product_update_tags);
router.get("/product-import", product_import);
router.get("/product-import/variants", product_import_with_variants);
router.get("/products/tags/add", tags_add);
router.get("/product/tags/add", product_tags_add);
router.get("/transfers", transfers);
router.post("/transfer/invoice", transfer_invoice);

export default router;
