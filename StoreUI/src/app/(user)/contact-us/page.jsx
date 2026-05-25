import "@/styles/contactUs.scss";


export default function ContactUs() {
    return (
        <>
            <section className="contact-area section-padding">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6">
                            <div className="contact-message">
                                <h4 className="contact-title">Tell Us Your Project</h4>
                                <form id="contact-form" action="https://whizthemes.com/mail-php/genger/mail.php" method="post" className="contact-form">
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <input name="first_name" placeholder="Name *" type="text" required />
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <input name="phone" placeholder="Phone *" type="text" required />
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <input name="email_address" placeholder="Email *" type="text" required />
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-6">
                                            <input name="contact_subject" placeholder="Subject *" type="text" />
                                        </div>
                                        <div className="col-12">
                                            <div className="contact2-textarea text-center">
                                                <textarea placeholder="Message *" name="message" className="form-control2" required=""></textarea>
                                            </div>
                                            <div className="contact-btn">
                                                <button className="btn btn-sqr" type="submit">Send Message</button>
                                            </div>
                                        </div>
                                        <div className="col-12 d-flex justify-content-center">
                                            <p className="form-messege"></p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="contact-info">
                                <h4 className="contact-title">Contact Us</h4>
                                {/* <p>Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum
                                    est notare quam littera gothica, quam nunc putamus parum claram anteposuerit litterarum
                                    formas human.</p> */}
                                <p>To know about your order status or any product related queries feel free to send us a message on Whatsapp or drop an email. We will be glad to help you..</p>
                                <p>We&apos;re here - Connect at your ease</p>
                                <ul>
                                    {/* <li><i className="fa fa-fax"></i> Address : SAAB CONSTRUCTION LIMITED, Unit-18,  Heston Industrial Mall, Church Road, Hounslow, TW5 OLD, UK</li> */}
                                    <li> <i class="fa fa-envelope-o" ></i>
                                        E-mail: weddingtouchbysaadgi@gmail.com</li>
                                    <li><i className="fa fa-phone"></i>Phone no: (+91) 8968945525</li>
                                    <li><i class="fa fa-ticket" ></i>
                                    Support Timings : Mon - Sat - (10 AM - 7 PM)</li>
                                    <li><i class="fa fa-whatsapp" ></i>
                                        WhatsApp Support : Mon - Sat (10 AM - 7 PM)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
