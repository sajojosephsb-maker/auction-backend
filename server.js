// Define Schemas
const SaleSchema = new mongoose.Schema({ lot: String, buyer: String, rate: Number, weight: Number, date: { type: Date, default: Date.now } });
const Sale = mongoose.model('Sale', SaleSchema);

const UserSchema = new mongoose.Schema({ userId: String, name: String, isApproved: { type: Boolean, default: false } });
const User = mongoose.model('User', UserSchema);

// Memory cache for speed
let authorizedBidders = {}; 

// Load existing users from DB on startup
async function loadUsers() {
    const users = await User.find();
    users.forEach(u => { if(u.isApproved) authorizedBidders[u.userId] = u.name; });
    console.log("Registered Bidders Loaded from DB");
}
loadUsers();
