title Entity Relationship Diagram
wedding_organization [icon: unity] {
id uuid
name string
email string
location string
created_at timestamp
}

wo_staff [icon: users] {
id uuid
wo_id uuid > wedding_organization.id
name string
email string
password_hash string
role string (admin,editor,viewer)
created_at timestamp
}

customers [icon: user] {
id uuid
wo_id uuid > wedding_organization.id
email string
male_name string
female_name string
created_at timestamp
}

templates [icon: paper-plane] {
id uuid
name string
thumbnail string
category string (basic,premium)
config jsonb
created_at timestamp
}

plan [icon: package] {
id uuid
name string
price int
created_at timestamp
}

plan_template [icon: link] {
id uuid
plan_id uuid > plan.id
template_id uuid > templates.id
created_at timestamp
}

wo_plan [icon: shopping-bag] {
id uuid
wo_id uuid > wedding_organization.id
plan_id uuid > plan.id
status string (active,expired)
start_date timestamp
end_date timestamp
created_at timestamp
}

customer_template [icon: bookmark] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
template_id uuid > templates.id
type string (wedding,anniversary)
active boolean
created_at timestamp
}

guests [icon: users] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
name string
rsvp_status boolean
guest_count int
reason string
created_at timestamp
}

cust_metadata [icon: data] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
customer_template_id uuid > customer_template.id
date timestamp
type string (wedding,anniversary)
image_id int < gallery.id
location string
address string
akad_date timestamp
reception_date timestamp
love_story jsonb
bank_account jsonb
created_at timestamp
}

gallery [icon: gallery-horizontal] {
id int
image jsonb
video string
created_at timestamp
}

cust_comment [icon: comment] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
guest_id uuid > guests.id
comment string
created_at timestamp
updated_at timestamp
}

attendance [icon: users] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
guest_id uuid > guests.id
created_at timestamp
}

photobooth [icon: camera] {
id uuid
wo_id uuid > wedding_organization.id
customer_id uuid > customers.id
image_url string
created_at timestamp
}

payment_method [icon: credit-card] {
id uuid
wo_id uuid > wedding_organization.id
type string (card,transfer,gopay,ovo)
provider string
token string
is_default boolean
created_at timestamp
}

invoice [icon: receipt] {
id uuid
wo_id uuid > wedding_organization.id
customer_template_id uuid > customer_template.id
invoice_number string
description string
subtotal int
tax int
total int
status string (pending,paid,overdue,cancelled,refunded)
due_date timestamp
paid_at timestamp
created_at timestamp
updated_at timestamp
}

payment [icon: bank-note] {
id uuid
invoice_id uuid > invoice.id
wo_id uuid > wedding_organization.id
payment_method_id uuid > payment_method.id
amount int
status string (pending,success,failed,refunded)
gateway string (xendit,midtrans,stripe)
gateway_ref string
paid_at timestamp
created_at timestamp
}
