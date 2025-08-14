# import random
# from datetime import datetime, timedelta
# import firebase_admin
# from firebase_admin import credentials, firestore

# # ------------------------------
# # STEP 1: FIREBASE SETUP
# # ------------------------------
# cred = credentials.Certificate("serviceAccountKey.json")  # Replace with your actual path
# firebase_admin.initialize_app(cred)
# db = firestore.client()

# # ------------------------------
# # STEP 2: STUDENT DATA
# # ------------------------------
# students = [
#     {"name": "David Alegre Abatey", "ref": "20895472"},
#     {"name": "Jeddy Paa Kojo Abban", "ref": "20929168"},
#     {"name": "Samuel Desmond Abbey Darko", "ref": "20882256"},
#     {"name": "Festus Abboah", "ref": "20888550"},
#     {"name": "Abdul-Latif Abdulai", "ref": "20941908"},
#     {"name": "Jalali-Din Wuni-Zaligu Abdulai", "ref": "20959145"},
#     {"name": "Umar Tijani Abdulai", "ref": "20948813"},
#     {"name": "Yahaya Yelpoea Abdul Haque", "ref": "20958508"},
#     {"name": "Abdul Latif Numbre Abdul Karim", "ref": "20913526"},
#     {"name": "Adnaan Abdul-Karim", "ref": "20885701"},
#     {"name": "Ansinmwini Raqib Abdul-Karim", "ref": "20924488"},
#     {"name": "Shamsudeen Abdul Rafiu", "ref": "20958028"},
#     {"name": "Ruweida Suhuyini Abdul Rasheed", "ref": "20924678"},
#     {"name": "Mujahid Abdul Rashid", "ref": "20895820"},
#     {"name": "Adama Abdul-Samed", "ref": "20887644"},
#     {"name": "Elvis Frimpong Aboagye", "ref": "20913881"},
#     {"name": "Emmanuel Nana Sakyi Aboagye", "ref": "20838113"},
#     {"name": "Emmanuel Opoku Aboagye", "ref": "20951169"},
#     {"name": "Godfred Abora", "ref": "20896841"},
#     {"name": "Francis Acheampong", "ref": "20929071"},
#     {"name": "Shadrack Adu Sarfo Acheampong", "ref": "20883806"},
#     {"name": "Divine Elikem Ackah", "ref": "20954179"},
#     {"name": "Gideon Acquah", "ref": "20938987"},
#     {"name": "Kelvin Anii Acquah", "ref": "20895059"},
#     {"name": "Esther Efua Acquandoh", "ref": "20931721"},
#     {"name": "Prince Adams", "ref": "20881892"},
#     {"name": "Godfred Boakye Adarkwa", "ref": "20944659"},
#     {"name": "Isaac Addai", "ref": "20954328"},
#     {"name": "Nana Yaw Addai", "ref": "20889569"},
#     {"name": "Chris Anome Paa Yaw Addo", "ref": "20887259"},
#     {"name": "Kwaku Addo-Gyamfi", "ref": "20889017"},
#     {"name": "Christian Nii Antiaye Addy", "ref": "20948514"},
#     {"name": "Albert Arko Adjei", "ref": "20948017"},
#     {"name": "Gideon Adjei", "ref": "20909312"},
#     {"name": "Kelvin Ankamah Adjei", "ref": "20943941"},
#     {"name": "John Kwaku Adomako", "ref": "20884793"},
#     {"name": "Roger Osafo Kwabena Adu", "ref": "20893492"},
#     {"name": "Michael Adu-Asante", "ref": "20914373"},
#     {"name": "Isaac Adu Boahen", "ref": "20852125"},
#     {"name": "Nana Kojo Adu-Brempong", "ref": "20921110"},
#     {"name": "Felix Adu Mensah Amofah", "ref": "20956721"},
#     {"name": "Phil Nortey Adumua-Dowuona", "ref": "20923276"},
#     {"name": "Andy Adu Nyarko", "ref": "20922992"},
#     {"name": "Christian Adusei", "ref": "20938530"},
#     {"name": "Mabel Delali Afesey", "ref": "20882814"},
#     {"name": "Louisa Henewaa Afful", "ref": "20927403"},
#     {"name": "Akua Afrakoma", "ref": "20890176"},
#     {"name": "Joshua Bubune Agbeke", "ref": "20948245"},
#     {"name": "Micheal Mawuli Agbeko", "ref": "20828221"},
#     {"name": "Fadl Adams Agbo", "ref": "20954149"},
#     {"name": "Mahfuz Agbor Seidu", "ref": "20953083"},
#     {"name": "Raymond Agbozo", "ref": "20874354"},
#     {"name": "Kobbie Eyram Aggor", "ref": "20932914"},
#     {"name": "Mawuena Kofi Samuel Agotse", "ref": "20915946"},
#     {"name": "Ebenezer Ntiakoh Agyapong", "ref": "20957347"},
#     {"name": "Akwasi Poku Ofori Agyei", "ref": "20943728"},
#     {"name": "Gladys Agyeman-Duah", "ref": "20923802"},
#     {"name": "Christabel Yaa Agyemang", "ref": "20925879"},
#     {"name": "John Agyemang", "ref": "20885632"},
#     {"name": "Kelvin Ntim Agyemang", "ref": "20924562"},
#     {"name": "Nana Akua Agyemang", "ref": "20901988"},
#     {"name": "Daniel Agyemang-Badu", "ref": "20944358"},
#     {"name": "Ronald Ofoe Ahado", "ref": "20913295"},
#     {"name": "Etornam Kordzo Ahiataku", "ref": "20954788"},
#     {"name": "Jude Kekeli Yaw Ahiekpor", "ref": "20920037"},
#     {"name": "Fredrick Kofi Sedinam Ahorgbah", "ref": "20828297"},
#     {"name": "Sampson Aidoo", "ref": "20942504"},
#     {"name": "Burjwok Paulo Deng Ajang", "ref": "21460110"},
#     {"name": "Prince Awonaab Ajuitey", "ref": "20921418"},
#     {"name": "Brian Webadua Akanlu", "ref": "20903698"},
#     {"name": "Leonard Awonwie Akisi", "ref": "20906102"},
#     {"name": "Theophilus Wunzooma Akonsi", "ref": "20773606"},
#     {"name": "Emmanuella Amenuveve Akorsu", "ref": "20924066"},
#     {"name": "Samuel Katey Akpanglo", "ref": "20952219"},
#     {"name": "Jeremiah Narteh Akuaku", "ref": "20917864"},
#     {"name": "Bismark Akwah", "ref": "20959239"},
#     {"name": "Maxwell Akyen Abban", "ref": "20921083"},
#     {"name": "Abdul Rauf Alhassan", "ref": "20886524"},
#     {"name": "Iman Alhassan Diasso", "ref": "20958038"},
#     {"name": "Rex Allassani", "ref": "20914160"},
#     {"name": "Elton Amankonah-Henneh", "ref": "20948582"},
#     {"name": "Evans Amartei Amarh", "ref": "20918111"},
#     {"name": "Roland Teye Amartey", "ref": "20953558"},
#     {"name": "Selikem Kwasi Amegashie", "ref": "20900492"},
#     {"name": "David Asante Ameyaw", "ref": "20887040"},
#     {"name": "Seth Ameyaw", "ref": "20940143"},
#     {"name": "Gilbert Amissah", "ref": "20920710"},
#     {"name": "Caleb Frimpong Amoafo", "ref": "20890629"},
#     {"name": "Benjamin Amoah", "ref": "20932606"},
#     {"name": "Gerald Addey Amoatey", "ref": "20887952"},
#     {"name": "Emily Maureen Ampah", "ref": "20962630"},
#     {"name": "Ofosu Michael Ampofo", "ref": "20888212"},
#     {"name": "Scott Kankam Ampong", "ref": "20945476"},
#     {"name": "Cyprian Kumi Amponsah", "ref": "20885827"},
#     {"name": "Enoch Amponsah", "ref": "20943090"},
#     {"name": "Awurabena Agyeiwaa Amponsah-Mensah", "ref": "20898934"},
#     {"name": "Stephen Owusu Amponsem", "ref": "20940474"},
#     {"name": "Elisha Anagi", "ref": "20859006"},
#     {"name": "David Anakpor", "ref": "20939705"},
#     {"name": "Eric Ankamah Anane", "ref": "20922313"},
#     {"name": "Michael Anang", "ref": "20901727"},
#     {"name": "Paapa Kobina Andam-Cobbold", "ref": "20896200"},
#     {"name": "Fredrick Andoh", "ref": "20932387"},
#     {"name": "Nhyira Esi Bodwewa Andoh", "ref": "20901896"},
#     {"name": "Henry Fynn Otchere Anguah", "ref": "20911054"},
#     {"name": "Kofi Korang Anim", "ref": "20949966"},
#     {"name": "Kwarteng Michael Anim", "ref": "20948482"},
#     {"name": "Evelyn Sarpong Anin", "ref": "20914471"},
#     {"name": "Kelvin Ankomah", "ref": "20948238"},
#     {"name": "Manasseh Papa Kwamena Ankrah", "ref": "20940813"},
#     {"name": "Nii Kpakpo Oti Ankrah", "ref": "20900077"},
#     {"name": "George Jnr Annan", "ref": "20918758"},
#     {"name": "Bright Anning", "ref": "20911364"},
#     {"name": "Marvinphil Sekoh Annorbah", "ref": "20937742"},
#     {"name": "Osei Cornelius Anokye", "ref": "20924307"},
#     {"name": "Winifred Anokye", "ref": "20907154"},
#     {"name": "Yaw Mark Anokye", "ref": "20882969"},
#     {"name": "Papa Yaw Anokye-Mensah", "ref": "20941916"},
#     {"name": "Michelle Frimpomaah Anorchie", "ref": "20919895"},
#     {"name": "Francis Ansah", "ref": "20948079"},
#     {"name": "Fredrick Owusu Ansah", "ref": "20905104"},
#     {"name": "Godfred Ansu", "ref": "20913582"},
#     {"name": "Collins Seth Antwi", "ref": "20921228"},
#     {"name": "Frank Oteng Antwi", "ref": "20942640"},
#     {"name": "Jeffrey Twum Antwi", "ref": "20923656"},
#     {"name": "Joshua Ohene Yaw Antwi", "ref": "20893797"},
#     {"name": "Nana Osei Assibey Antwi", "ref": "20913132"},
#     {"name": "Prince Amoako Antwi", "ref": "20900533"},
#     {"name": "Richel Nhyira Takyiwaa Antwi", "ref": "20905239"},
#     {"name": "Samuella Antwi", "ref": "20897398"},
#     {"name": "Yaa Asantewaa Antwi", "ref": "20891777"},
#     {"name": "Samuel Antwi-Adjei", "ref": "20885880"},
#     {"name": "Blessing Winbisisa Anyagri", "ref": "20941279"},
#     {"name": "Emmanuel Opoku Apau", "ref": "20870251"},
#     {"name": "Theophilus Ossana Apedo", "ref": "20907163"},
#     {"name": "Reindolf Akwasi Appiagyei", "ref": "20889050"},
#     {"name": "Bridget Mensah Appiah", "ref": "20873970"},
#     {"name": "Christiana Afia Appiah", "ref": "20911280"},
#     {"name": "Derrick Ofori Appiah", "ref": "20910159"},
#     {"name": "Gifty Appiah", "ref": "20905972"},
#     {"name": "Moses Edward Appiah", "ref": "20911743"},
#     {"name": "Richard Appiah", "ref": "20914352"},
#     {"name": "Desmond Appiah-Kubi", "ref": "20959161"},
#     {"name": "Silas Arkoh", "ref": "20908974"},
#     {"name": "Selase Arku", "ref": "20899853"},
#     {"name": "Melike Arkutu", "ref": "20960313"},
#     {"name": "John Armah", "ref": "20908192"},
#     {"name": "Lawrence Nii Armah", "ref": "20939860"},
#     {"name": "Frank Annor Arthur", "ref": "20957659"},
#     {"name": "Godwyll Essel Aryee", "ref": "20913278"},
#     {"name": "Manasseh Asaah", "ref": "20927077"},
#     {"name": "Eugene Amponsah Asabere", "ref": "20903850"},
#     {"name": "Jensen Kweku Sedem Asafo-Adjei", "ref": "20918864"},
#     {"name": "Clinton Asamoah", "ref": "20912996"},
#     {"name": "Robert Ebo Asamoah", "ref": "20913464"},
#     {"name": "Eric Asante", "ref": "20913870"},
#     {"name": "Ernest Kwame Opoku Asante", "ref": "20949135"},
#     {"name": "Faustina Frimpongmaa Ama Asante", "ref": "20885096"},
#     {"name": "Kwabena Sefa Asante", "ref": "20897141"},
#     {"name": "Kwame Junior Asante", "ref": "20941299"},
#     {"name": "Benedict Nana Asare", "ref": "20898775"},
#     {"name": "Emmanuel Nana Asare", "ref": "20885484"},
#     {"name": "Fredinald Owusu Achiaw Asare", "ref": "20896026"},
#     {"name": "Francis Nana Asante Asare-Odei", "ref": "20882038"},
#     {"name": "Kwabena Sefa Asante", "ref": "20897141"},
#     {"name": "Christiana Afia Appiah", "ref": "20911280"},
#     {"name": "Nemenlah Erzuah Freeman", "ref": "20898289"}
# ]

# # ------------------------------
# # STEP 3: TUTOR POOL
# # ------------------------------
# tutor_ids = ["T001","T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010", "T011", "T012", "T013", "T014", "T015"]

# # ------------------------------
# # STEP 4: Generate Firestore Documents
# # ------------------------------
# for student in students:
#     ref = student["ref"]
#     name = student["name"]

#     dob_year = random.randint(1985, 2005)  # Makes them 19+
#     dob_month = random.randint(1, 12)
#     dob_day = random.randint(1, 28)  # Keep it simple

#     student_data = {
#         "course": "Bsc. Computer Science",
#         "currentlyInChat": False,
#         "dateOfBirth": datetime(dob_year, dob_month, dob_day),
#         "fullName": name,
#         "hasSignedUp": False,
#         "studentId": str(random.randint(3000000, 3999999)),
#         "tutorId": random.choice(tutor_ids),
#         "username": name,
#         "yearOfStudy": 3
#     }

#     db.collection("StudentRecords").document(ref).set(student_data)
#     print(f"✅ Created document for {name} (Ref: {ref})")

# print("🎉 All documents uploaded.")

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime
import random

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")  # Ensure path is correct
firebase_admin.initialize_app(cred)
db = firestore.client()

# Reference the collection
collection_ref = db.collection("StudentRecords")

# Get all documents
docs = collection_ref.stream()

# Loop through documents and update dateOfBirth
for doc in docs:
    doc_ref = collection_ref.document(doc.id)

    # Generate a random date (above 19 years old)
    tutor_ids = ["T001","T002", "T003", "T004", "T005", "T006", "T007", "T008", "T009", "T010", "T011", "T012", "T013", "T014", "T015"]
    random_id = random.choice(tutor_ids)

    # Update Firestore
    doc_ref.update({
        "tutorId": random_id
    })

    print(f"✅ Updated {doc.id} with tutorId: {random_id}")

print("🎉 All student tutorIds fields updated.")
