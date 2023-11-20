// Event bus instance
const eventBus = new Vue();

// store-product component with data, methods and computed fields
Vue.component('store-product', {
    // Props field
    props: {
        // Premium prop used to determine if a free shipping "anniversary event" is on
        premium: {
            type: Boolean,
            required: true
        }
    },
    // HTML template
    template: `
        <div class="products">
            <div class="title">
                <h2>Shop Our Range Of Gundam Model Kits</h2>
                <!-- Shipping data field -->
                <p v-if="premium">Free Shipping Anniversary Celebration On Now!</p>
                <p>All Shipping: \${{shipping}}</p>
            </div>
            <div class="productRow">
                <div v-for="(product, index) in products.product" key="product.id" class="product">
                    <img v-bind:src="product.image" v-bind:alt="name" class="productImage"></img>
                    <!-- Product name data field -->
                    <h4>{{product.name}}</h4>
                    <!-- Price field -->
                    <p>Price: \${{product.price}}</p>
                    <!-- IF condition for stock count -->
                    <p v-if="product.inStock">In Stock</p>
                    <p v-else>Out Of Stock</p>
                    <!-- Add to cart button -->
                    <button v-on:click="addToCart(product)" v-bind:disabled="!product.inStock">Add To Cart</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            // Products list for providing product details to v-for
            products: {
                product: [
                    {id: 1, image: 'images/aerial.jpg', name: 'Gundam HG Aerial', price: 20.00, inStock: true},
                    {id: 2, image: 'images/freedom.jpg', name: 'Gundam MG Freedom', price: 60.00, inStock: true},
                    {id: 3, image: 'images/calibarn.jpg', name: 'Gundam HG Calibarn', price: 20.00, inStock: true},
                    {id: 4, image: 'images/lfrith.jpg', name: 'Gundam HG Lfirth', price: 20.00, inStock: true},
                    {id: 5, image: 'images/sazabi.jpg', name: 'Gundam RG Sazabi', price: 40.00, inStock: true},
                    {id: 6, image: 'images/michaelis.jpg', name: 'Gundam HG Michaelis', price: 20.00, inStock: true}
                ]
            }
        };
    },
    methods: {
        // Send the product id of the product to the parent class (main Vue instance) method updateCart
        addToCart(product) {
            this.$parent.updateCart(product);
        }
    },
    // Computed shipping price
    computed: {
        shipping() {
            return this.premium ? '0.00' : '9.99';
        }
    },
});

// Review component
Vue.component('product-review', {
    // HTML template
    template: `
    <div class="review-form">
        <form @submit.prevent="onSubmit">
            <!-- Check for errors in the submission -->
            <p v-if="errors.length">
                <b>The following error(s) occured with your review:</b>
                <ul>
                    <!-- List errors -->
                    <li v-for="error in errors" :key="error">{{ error }}</li>
                </ul>
            </p>
            <p>
                <!-- Name field -->
                <label for="name">Name:</label>
                <input id="name" pattern="[a-zA-Z]*" v-model="name">
            </p>
            <p>
                <!-- Review field -->
                <label for="review">Review:</label>
                <textarea id="review" v-model="review"></textarea>
            </p>
            <p>
                <!-- Rating drop down -->
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            <p>
                <!-- Submit button -->
                <input type="submit" value="Submit">
            </p>
        </form>
    `,
    data() {
        return {
            // Empty data fields for HTML
            name: '',
            review: '',
            rating: null,
            errors: [],
        };
    },
    methods: {
        // Submission trigger function
        onSubmit() {
            if (this.name && this.review && this.rating) {
                // Review object created on successful submit
                const productReview = {
                name: this.name,
                review: this.review,
                rating: this.rating,
            };
            // Event bus event emitter
            eventBus.$emit('review-submitted', productReview);
            this.name = '';
            this.review = '';
            this.rating = null;
            } else {
                // Error messages
                this.errors = [];
                if (!this.name) this.errors.push('Name required.');
                if (!this.review) this.errors.push('Review required.');
                if (!this.rating) this.errors.push('Rating required.');
            }
        },
    },
});

// Tabs component
Vue.component('product-tabs', {
    // HTML template
    template: `
        <div class="reviewSection">
            <div class="product-tabs">
                <button class="tab" v-on:click="showReviews = true">See Reviews</button>
                <button class="tab" v-on:click="showReviews = false">Add Review</button>
            </div>

            <div v-if="showReviews" class="product-reviews">
                <h2>Store Reviews</h2>
                <p v-if="!reviews.length">No reviews yet!<p/>
                <div class="reviewRow">
                    <div v-for="review in reviews" class="reviewItem">
                        <p><b>{{review.name}} says:</b></p>
                        <p>{{review.review}}</p>
                        <p><b>Rating: {{review.rating}} stars.</b></p>
                    </div>
                </div>
            </div>
            <div v-else>
                <product-review></product-review>
            </div>
        </div>
    `,
    // data() to provide the default value of selectedTab and an empty array for reviews
    data() {
        return {
            showReviews: true,
            reviews: [],
        };
    },
    mounted() {
        // Event bus used to listen for review-submitted from product-review and push it to the reviews array
        eventBus.$on('review-submitted', (productReview) => {
            this.reviews.push(productReview);
        });
    },
});

// Cart component
Vue.component('product-cart', {
    props: ['cart'],
    template: `
        <div class="cartSection">
            <button class="tab" v-on:click="showCart = true">Show Cart</button>
            <button class="tab" v-on:click="showCart = false">Hide Cart</button>
            <div v-if="showCart">
                <h2>Your Cart</h2>
                <p v-if="cart.length === 0">No products added yet, browse our selection of products.</p>
                <p v-if="cart.length">Cart Price: \${{cartPrice}}</p>
                <p v-if="cart.length">Shipping: \${{shipping}}</p>
                <a v-if="cart.length" class="checkoutButton" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley" target="_blank">Checkout</a>
                <div v-if="cart.length" class="cartRow">
                    <div v-for="item in cart" v-bind:key="item.id" class="cartItem">
                        <img v-bind:src="item.image" v-bind:alt="item.name" class="cartImage"></img>
                        <!-- Product name data field -->
                        <h4>{{item.name}}</h4>
                        <!-- Price field -->
                        <p>Price: \${{item.price}}</p>
                        <button v-on:click="removeFromCart(item.id)">Remove from Cart</button
                    </div>
                </div>
                
            </div>
        </div>
    `,
    data() {
        return {
            showCart: true
        };
    },
    computed: {
        shipping() {
            return this.premium ? '0.00' : '9.99';
        },
        cartPrice() {
            // Sum of item.price in cart
            let cartTotal = this.cart.reduce((sum, item) => sum + item.price, 0);
            return cartTotal;
        },
    },
    methods: {
        // Use the index given of the function to splice the matching id from the cart array
        removeFromCart(productId) {
            const index = this.cart.findIndex(item => item.id === productId);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
          },
    }
})

// Main Vue instance
const main = new Vue({
    el: '#app',
    data: {
        premium: false,
        cart: [],
    },
    methods: {
        // Method to push product details from product to an object in the cart array
        updateCart(product) {
            this.cart.push({ 
                id: product.id,
                image: product.image, 
                name: product.name,  
                price: product.price 
            });
        },
    },
});