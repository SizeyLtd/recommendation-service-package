/*
 * To use Sizey recommendation, you can use this script to make process simler.
 * This script is not dependant to any e-commerce platform. Only requirement is that this script
 * is loaded somewhere in e-shop and HTML -element is created having id sizey-container.
 *
 * This script will automatically add all the needed elements inside that container.
 * This can be achieved in WooCommerce with following code.
 *
 * add_action( 'wp_enqueue_scripts', 'sizey_scripts' );
 * function sizey_scripts() {
 *   	wp_enqueue_script('sizeyjs', 'http://<your-shop.com>/wp-content/themes/twentytwentytwo/sizey-recommendation.js');
 * };
 *
 * add_action( 'woocommerce_after_add_to_cart_button', 'add_sizey_container', 10, 0 );
 * function add_sizey_container() {
 *   	global $product;
 *   	$id = $product->get_id();
*
*       echo '<span data-productId="' . $id . '" id="sizey-container"></span>';
* };
*
*/

/*
const variationArticleNumbers = [];
$("[data-variation-ean]").each(function () {
  variationArticleNumbers.push($(this).data("variation-ean"));
});

if (variationArticleNumbers) {
  const sizeyProduct = variationArticleNumbers[0];
  $("#sizey-container").attr("data-productean", sizeyProduct);
}
*/

/*
* To get the service working you need to add your Sizey APIKEY!
* You will find your own Sizey APIKEY from your sizey portal account https://portal.sizey.ai/my-apikeys
 * To get your own APIKEY you need to sign-up to Sizey Portal and create your own Customer Account.
 * Add Sizey APIKEY here:
 */

/*
 * These are variables you can change, but is not mandatory. This script will automatically
* create a link that opens a recommendation process.
*/
let APIKEY;
let RECOMMENDATION_LINK_TEXT;
let RECOMMENDATION_BUTTON_TEXT;
let showAsLink;
const RECOMMENDATION_TEXT = "Your size recommendation is $SIZE";
const RECOMMENDATION_NOTFOUND_TEXT = "Unable to get recommendation for this product.";

/* 
if your web-shop (and brand) is using UPC or EAN code for product variation you can use the following query to find size chart match for your variations
*/
const hasSizeyChart = async (dataValues) => {
  const { upc, productid, brand, garment } = dataValues;

  const queryParams = new URLSearchParams({
    apikey: APIKEY,
    ...(upc !== undefined && { upc }),
    ...(productid !== undefined && { productid }),
    ...(brand !== undefined && { brand }),
    ...(garment !== undefined && { garment }),
  });

  const apiUrl = `https://recommendation-api.sizey.ai/sizecharts?${queryParams.toString()}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "x-sizey-key": APIKEY,
      },
    });
    const result = await response.json();
    return !!result?.id;
  } catch (error) {
    console.error("Error fetching size chart:", error);
    return false;
  }
};

/*
If your web-shop is using internal (non general) product id, then you can use the follwowing query for size chart match 
*/

/*
const hasSizeyChart = async (productId) => {
  const product = await fetch('https://vroom-api.sizey.ai/products/' + productId, { headers: { 'x-sizey-key': APIKEY } }).then(o => o.json()).catch(err => ({}));
    return !!product?.sizeChart?.id;
}
*/

// choose either one for your needs!!

/* 
if your web-shop (and brand) is using UPC or EAN code for product variation you can use the following query size recommendation for your products
*/

const openRecommendationPopup = ({ upc, brand, garment, productid }) => {
  const queryParams = { apikey: APIKEY };

  if (upc) queryParams['upc'] = upc;
  if (brand) queryParams['brand'] = brand;
  if (garment) queryParams['garment'] = garment;
  if (productid) queryParams['productId'] = productid;

  const queryString = Object.keys(queryParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  window.open(
    `https://my.sizey.ai/recommendation?${queryString}&measurementId=null`,
    "",
    "width=800,height=800"
  );
};

/* 
if your web-shop (and brand) is using internal (non general) product id, then you can use the following query size recommendation for your products
*/

// choose either one for your needs!!

  
const sizeyContainer = document.querySelector("#sizey-container");
if (sizeyContainer) {
  if(typeof sizey_api_data !== "undefined"){
    APIKEY = sizey_api_data.APIKEY || 'TzQzeGZXOU5CQ0RSS1N4TEhyb1k6bTlDNEttUVM=';
    RECOMMENDATION_LINK_TEXT = sizey_api_data.RECOMMENDATION_LINK_TEXT || "Test your size";
    RECOMMENDATION_BUTTON_TEXT = sizey_api_data.RECOMMENDATION_BUTTON_TEXT || "Test your size";
    showAsLink = sizey_api_data.showAsLink === 'true';
  }else {
    APIKEY = sizeyContainer.getAttribute("apikey") || 'TzQzeGZXOU5CQ0RSS1N4TEhyb1k6bTlDNEttUVM=';
    RECOMMENDATION_LINK_TEXT = sizeyContainer.getAttribute("recommendation_link_text") || "Test your size";
    RECOMMENDATION_BUTTON_TEXT = sizeyContainer.getAttribute("recommendation_button_text") || "Test your size";
    showAsLink = sizeyContainer.getAttribute("showaslink") === "true";
  }

  const dataAttributes = ['upc', 'productid', 'brand', 'garment'];
  const dataValues = {};
  dataAttributes.forEach(attribute => {
    const value = sizeyContainer.dataset[attribute];
    if (value) {
      dataValues[attribute] = value;
    }
  });

  if (hasSizeyChart(dataValues)) {
    var element;
    var elementText;
    if (showAsLink) {
      element = document.createElement('a');
      element.href = '#';
      elementText = document.createTextNode(RECOMMENDATION_LINK_TEXT);
      element.appendChild(elementText);
    } else {
      element = document.createElement('button');
      element.className = 'recommendation-service-button';
      elementText = document.createTextNode(RECOMMENDATION_BUTTON_TEXT);
      element.appendChild(elementText);
    }
    element.id = "open-sizey";

    element.onclick = (ev) => {
      var recommendationNode = document.sizeyContainer;
      if (recommendationNode) {
        recommendationNode.innerText = "";
      }

      openRecommendationPopup(dataValues);
      ev.preventDefault();
    };
    sizeyContainer.appendChild(element);
  }
}else {
  alert("sizey-container not found.");
}
