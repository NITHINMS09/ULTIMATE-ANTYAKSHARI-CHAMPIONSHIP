/**
 * @fileoverview Song Database — 300+ songs across multiple languages
 * with search, filter, and fuzzy matching capabilities
 */

const songs = [
  // ── HINDI / BOLLYWOOD ───────────────────────────────────
  { id: 1, title: "Ae Dil Hai Mushkil", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", language: "hindi", year: 2016, firstLetter: "A" },
  { id: 2, title: "Aaj Kal Tere Mere Pyar Ke Charche", artist: "Mohammed Rafi", movie: "Brahmachari", language: "hindi", year: 1968, firstLetter: "A" },
  { id: 3, title: "Abhi Mujh Mein Kahin", artist: "Sonu Nigam", movie: "Agneepath", language: "hindi", year: 2012, firstLetter: "A" },
  { id: 4, title: "Apna Bana Le", artist: "Arijit Singh", movie: "Bhediya", language: "hindi", year: 2022, firstLetter: "A" },
  { id: 5, title: "Agar Tum Saath Ho", artist: "Arijit Singh", movie: "Tamasha", language: "hindi", year: 2015, firstLetter: "A" },
  { id: 6, title: "Ainvayi Ainvayi", artist: "Salim Merchant", movie: "Band Baaja Baaraat", language: "hindi", year: 2010, firstLetter: "A" },
  { id: 7, title: "Ajeeb Daastaan Hai Yeh", artist: "Lata Mangeshkar", movie: "Dil Apna Aur Preet Parai", language: "hindi", year: 1960, firstLetter: "A" },
  { id: 8, title: "Apna Time Aayega", artist: "Ranveer Singh", movie: "Gully Boy", language: "hindi", year: 2019, firstLetter: "A" },
  { id: 9, title: "Afreen Afreen", artist: "Rahat Fateh Ali Khan", movie: "Single", language: "hindi", year: 2016, firstLetter: "A" },
  { id: 10, title: "Awaara Hoon", artist: "Mukesh", movie: "Awaara", language: "hindi", year: 1951, firstLetter: "A" },
  { id: 11, title: "Bahon Mein Chale Aao", artist: "Lata Mangeshkar", movie: "Anamika", language: "hindi", year: 1973, firstLetter: "B" },
  { id: 12, title: "Baazigar O Baazigar", artist: "Kumar Sanu", movie: "Baazigar", language: "hindi", year: 1993, firstLetter: "B" },
  { id: 13, title: "Bekhayali", artist: "Sachet Tandon", movie: "Kabir Singh", language: "hindi", year: 2019, firstLetter: "B" },
  { id: 14, title: "Bulleya", artist: "Amit Mishra", movie: "Ae Dil Hai Mushkil", language: "hindi", year: 2016, firstLetter: "B" },
  { id: 15, title: "Badtameez Dil", artist: "Benny Dayal", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "B" },
  { id: 16, title: "Balam Pichkari", artist: "Vishal Dadlani", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "B" },
  { id: 17, title: "Bole Chudiyan", artist: "Udit Narayan", movie: "Kabhi Khushi Kabhie Gham", language: "hindi", year: 2001, firstLetter: "B" },
  { id: 18, title: "Baaki Baatein Peene Baad", artist: "Arjun Kanungo", movie: "Single", language: "hindi", year: 2015, firstLetter: "B" },
  { id: 19, title: "Banno Tera Swagger", artist: "Brijesh Shandilya", movie: "Tanu Weds Manu Returns", language: "hindi", year: 2015, firstLetter: "B" },
  { id: 20, title: "Bezubaan Phir Se", artist: "Sukhwinder Singh", movie: "ABCD 2", language: "hindi", year: 2015, firstLetter: "B" },
  { id: 21, title: "Chaiyya Chaiyya", artist: "Sukhwinder Singh", movie: "Dil Se", language: "hindi", year: 1998, firstLetter: "C" },
  { id: 22, title: "Channa Mereya", artist: "Arijit Singh", movie: "Ae Dil Hai Mushkil", language: "hindi", year: 2016, firstLetter: "C" },
  { id: 23, title: "Chura Liya Hai Tumne", artist: "Mohammed Rafi", movie: "Yaadon Ki Baaraat", language: "hindi", year: 1973, firstLetter: "C" },
  { id: 24, title: "Chammak Challo", artist: "Akon", movie: "Ra.One", language: "hindi", year: 2011, firstLetter: "C" },
  { id: 25, title: "Chand Sifarish", artist: "Shaan", movie: "Fanaa", language: "hindi", year: 2006, firstLetter: "C" },
  { id: 26, title: "Chalte Chalte", artist: "Lata Mangeshkar", movie: "Pakeezah", language: "hindi", year: 1972, firstLetter: "C" },
  { id: 27, title: "Chura Ke Dil Mera", artist: "Kumar Sanu", movie: "Main Khiladi Tu Anari", language: "hindi", year: 1994, firstLetter: "C" },
  { id: 28, title: "Chicken Song", artist: "Mohit Chauhan", movie: "Bajrangi Bhaijaan", language: "hindi", year: 2015, firstLetter: "C" },
  { id: 29, title: "Cutie Pie", artist: "Nakash Aziz", movie: "ABCD 2", language: "hindi", year: 2015, firstLetter: "C" },
  { id: 30, title: "Churake Dil Mera", artist: "Kumar Sanu", movie: "Main Khiladi Tu Anari", language: "hindi", year: 1994, firstLetter: "C" },
  { id: 31, title: "Dil To Pagal Hai", artist: "Lata Mangeshkar", movie: "Dil To Pagal Hai", language: "hindi", year: 1997, firstLetter: "D" },
  { id: 32, title: "Dil Chahta Hai", artist: "Shankar Mahadevan", movie: "Dil Chahta Hai", language: "hindi", year: 2001, firstLetter: "D" },
  { id: 33, title: "Dil Se Re", artist: "A.R. Rahman", movie: "Dil Se", language: "hindi", year: 1998, firstLetter: "D" },
  { id: 34, title: "Dilbar Dilbar", artist: "Neha Kakkar", movie: "Satyameva Jayate", language: "hindi", year: 2018, firstLetter: "D" },
  { id: 35, title: "Dil Diyan Gallan", artist: "Atif Aslam", movie: "Tiger Zinda Hai", language: "hindi", year: 2017, firstLetter: "D" },
  { id: 36, title: "Deewani Mastani", artist: "Shreya Ghoshal", movie: "Bajirao Mastani", language: "hindi", year: 2015, firstLetter: "D" },
  { id: 37, title: "Duniya Mein Logon Ko", artist: "Asha Bhosle", movie: "Apna Desh", language: "hindi", year: 1972, firstLetter: "D" },
  { id: 38, title: "Dheere Dheere Se", artist: "Kumar Sanu", movie: "Aashiqui", language: "hindi", year: 1990, firstLetter: "D" },
  { id: 39, title: "Dance Pe Chance", artist: "Sunidhi Chauhan", movie: "Rab Ne Bana Di Jodi", language: "hindi", year: 2008, firstLetter: "D" },
  { id: 40, title: "Desi Girl", artist: "Sunidhi Chauhan", movie: "Dostana", language: "hindi", year: 2008, firstLetter: "D" },
  { id: 41, title: "Ek Ladki Ko Dekha", artist: "Kumar Sanu", movie: "1942 A Love Story", language: "hindi", year: 1994, firstLetter: "E" },
  { id: 42, title: "Ek Villain Title Track", artist: "Mithoon", movie: "Ek Villain", language: "hindi", year: 2014, firstLetter: "E" },
  { id: 43, title: "Enna Sona", artist: "Arijit Singh", movie: "Ok Jaanu", language: "hindi", year: 2017, firstLetter: "E" },
  { id: 44, title: "Eena Meena Deeka", artist: "Kishore Kumar", movie: "Aasha", language: "hindi", year: 1957, firstLetter: "E" },
  { id: 45, title: "Ek Do Teen", artist: "Madhuri Dixit", movie: "Tezaab", language: "hindi", year: 1988, firstLetter: "E" },
  { id: 46, title: "Ek Pyar Ka Nagma Hai", artist: "Lata Mangeshkar", movie: "Shor", language: "hindi", year: 1972, firstLetter: "E" },
  { id: 47, title: "Falak Tak Chal", artist: "Udit Narayan", movie: "Tashan", language: "hindi", year: 2008, firstLetter: "F" },
  { id: 48, title: "Fevicol Se", artist: "Mamta Sharma", movie: "Dabangg 2", language: "hindi", year: 2012, firstLetter: "F" },
  { id: 49, title: "Filhall", artist: "B Praak", movie: "Single", language: "hindi", year: 2019, firstLetter: "F" },
  { id: 50, title: "Gallan Goodiyaan", artist: "Sukhwinder Singh", movie: "Dil Dhadakne Do", language: "hindi", year: 2015, firstLetter: "G" },
  { id: 51, title: "Gerua", artist: "Arijit Singh", movie: "Dilwale", language: "hindi", year: 2015, firstLetter: "G" },
  { id: 52, title: "Ghungroo", artist: "Arijit Singh", movie: "War", language: "hindi", year: 2019, firstLetter: "G" },
  { id: 53, title: "Ghar More Pardesiya", artist: "Shreya Ghoshal", movie: "Kalank", language: "hindi", year: 2019, firstLetter: "G" },
  { id: 54, title: "Ghagra", artist: "Rekha Bhardwaj", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "G" },
  { id: 55, title: "Ghoomar", artist: "Shreya Ghoshal", movie: "Padmaavat", language: "hindi", year: 2018, firstLetter: "G" },
  { id: 56, title: "Hawa Hawai", artist: "Kavita Krishnamurthy", movie: "Mr. India", language: "hindi", year: 1987, firstLetter: "H" },
  { id: 57, title: "Hum Tumhare Hain Sanam", artist: "S.P. Balasubrahmanyam", movie: "Hum Tumhare Hain Sanam", language: "hindi", year: 2002, firstLetter: "H" },
  { id: 58, title: "Hawayein", artist: "Arijit Singh", movie: "Jab Harry Met Sejal", language: "hindi", year: 2017, firstLetter: "H" },
  { id: 59, title: "High Heels Te Nachche", artist: "Jaz Dhami", movie: "Ki & Ka", language: "hindi", year: 2016, firstLetter: "H" },
  { id: 60, title: "Hum Aapke Hain Koun", artist: "S.P. Balasubrahmanyam", movie: "Hum Aapke Hain Koun", language: "hindi", year: 1994, firstLetter: "H" },
  { id: 61, title: "Humma Humma", artist: "A.R. Rahman", movie: "Bombay", language: "hindi", year: 1995, firstLetter: "H" },
  { id: 62, title: "Haan Tu Hai", artist: "K.K.", movie: "Jannat", language: "hindi", year: 2008, firstLetter: "H" },
  { id: 63, title: "Ilahi", artist: "Arijit Singh", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "I" },
  { id: 64, title: "Ishq Wala Love", artist: "Neeti Mohan", movie: "Student of the Year", language: "hindi", year: 2012, firstLetter: "I" },
  { id: 65, title: "Ishqyaun Dhishqyaun", artist: "Arijit Singh", movie: "Goliyon Ki Raasleela Ram-Leela", language: "hindi", year: 2013, firstLetter: "I" },
  { id: 66, title: "Inteha Ho Gayi", artist: "Atif Aslam", movie: "Single", language: "hindi", year: 2005, firstLetter: "I" },
  { id: 67, title: "Jaadu Hai Nasha Hai", artist: "Shreya Ghoshal", movie: "Jism", language: "hindi", year: 2003, firstLetter: "J" },
  { id: 68, title: "Jhoome Jo Pathaan", artist: "Arijit Singh", movie: "Pathaan", language: "hindi", year: 2023, firstLetter: "J" },
  { id: 69, title: "Janam Janam", artist: "Arijit Singh", movie: "Dilwale", language: "hindi", year: 2015, firstLetter: "J" },
  { id: 70, title: "Jab Tak Hai Jaan", artist: "Javed Ali", movie: "Jab Tak Hai Jaan", language: "hindi", year: 2012, firstLetter: "J" },
  { id: 71, title: "Jeene Laga Hoon", artist: "Atif Aslam", movie: "Ramaiya Vastavaiya", language: "hindi", year: 2013, firstLetter: "J" },
  { id: 72, title: "Jabra Fan", artist: "Nakash Aziz", movie: "Fan", language: "hindi", year: 2016, firstLetter: "J" },
  { id: 73, title: "Kal Ho Naa Ho", artist: "Sonu Nigam", movie: "Kal Ho Naa Ho", language: "hindi", year: 2003, firstLetter: "K" },
  { id: 74, title: "Kuch Kuch Hota Hai", artist: "Udit Narayan", movie: "Kuch Kuch Hota Hai", language: "hindi", year: 1998, firstLetter: "K" },
  { id: 75, title: "Kesariya", artist: "Arijit Singh", movie: "Brahmastra", language: "hindi", year: 2022, firstLetter: "K" },
  { id: 76, title: "Kar Gayi Chull", artist: "Badshah", movie: "Kapoor & Sons", language: "hindi", year: 2016, firstLetter: "K" },
  { id: 77, title: "Kabhi Kabhi Mere Dil Mein", artist: "Mukesh", movie: "Kabhi Kabhie", language: "hindi", year: 1976, firstLetter: "K" },
  { id: 78, title: "Kabira", artist: "Arijit Singh", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "K" },
  { id: 79, title: "Kala Chashma", artist: "Badshah", movie: "Baar Baar Dekho", language: "hindi", year: 2016, firstLetter: "K" },
  { id: 80, title: "Kehna Hi Kya", artist: "Lata Mangeshkar", movie: "Bombay", language: "hindi", year: 1995, firstLetter: "K" },
  { id: 81, title: "Kaho Naa Pyaar Hai", artist: "Udit Narayan", movie: "Kaho Naa Pyaar Hai", language: "hindi", year: 2000, firstLetter: "K" },
  { id: 82, title: "Khairiyat", artist: "Arijit Singh", movie: "Chhichhore", language: "hindi", year: 2019, firstLetter: "K" },
  { id: 83, title: "Lag Ja Gale", artist: "Lata Mangeshkar", movie: "Woh Kaun Thi", language: "hindi", year: 1964, firstLetter: "L" },
  { id: 84, title: "London Thumakda", artist: "Labh Janjua", movie: "Queen", language: "hindi", year: 2014, firstLetter: "L" },
  { id: 85, title: "Laila Main Laila", artist: "Pawni Pandey", movie: "Raees", language: "hindi", year: 2017, firstLetter: "L" },
  { id: 86, title: "Laal Ishq", artist: "Arijit Singh", movie: "Goliyon Ki Raasleela Ram-Leela", language: "hindi", year: 2013, firstLetter: "L" },
  { id: 87, title: "Lungi Dance", artist: "Yo Yo Honey Singh", movie: "Chennai Express", language: "hindi", year: 2013, firstLetter: "L" },
  { id: 88, title: "Love Mera Hit Hit", artist: "Neeraj Shridhar", movie: "Billu", language: "hindi", year: 2009, firstLetter: "L" },
  { id: 89, title: "Mere Sapno Ki Rani", artist: "Kishore Kumar", movie: "Aradhana", language: "hindi", year: 1969, firstLetter: "M" },
  { id: 90, title: "Maahi Ve", artist: "A.R. Rahman", movie: "Highway", language: "hindi", year: 2014, firstLetter: "M" },
  { id: 91, title: "Main Agar Kahoon", artist: "Sonu Nigam", movie: "Om Shanti Om", language: "hindi", year: 2007, firstLetter: "M" },
  { id: 92, title: "Muskurane", artist: "Arijit Singh", movie: "CityLights", language: "hindi", year: 2014, firstLetter: "M" },
  { id: 93, title: "Masakali", artist: "Mohit Chauhan", movie: "Delhi-6", language: "hindi", year: 2009, firstLetter: "M" },
  { id: 94, title: "Malang Sajna", artist: "Sachet-Parampara", movie: "Malang", language: "hindi", year: 2020, firstLetter: "M" },
  { id: 95, title: "Mere Dholna", artist: "Shreya Ghoshal", movie: "Bhool Bhulaiyaa", language: "hindi", year: 2007, firstLetter: "M" },
  { id: 96, title: "Manwa Laage", artist: "Shreya Ghoshal", movie: "Happy New Year", language: "hindi", year: 2014, firstLetter: "M" },
  { id: 97, title: "Mast Magan", artist: "Arijit Singh", movie: "2 States", language: "hindi", year: 2014, firstLetter: "M" },
  { id: 98, title: "Main Hoon Na", artist: "Sonu Nigam", movie: "Main Hoon Na", language: "hindi", year: 2004, firstLetter: "M" },
  { id: 99, title: "Munni Badnaam Hui", artist: "Mamta Sharma", movie: "Dabangg", language: "hindi", year: 2010, firstLetter: "M" },
  { id: 100, title: "Mile Ho Tum Humko", artist: "Neha Kakkar", movie: "Fever", language: "hindi", year: 2016, firstLetter: "M" },
  { id: 101, title: "Naatu Naatu", artist: "Rahul Sipligunj", movie: "RRR", language: "hindi", year: 2022, firstLetter: "N" },
  { id: 102, title: "Nagada Sang Dhol", artist: "Shreya Ghoshal", movie: "Goliyon Ki Raasleela Ram-Leela", language: "hindi", year: 2013, firstLetter: "N" },
  { id: 103, title: "Nashe Si Chadh Gayi", artist: "Arijit Singh", movie: "Befikre", language: "hindi", year: 2016, firstLetter: "N" },
  { id: 104, title: "Naina Da Kya Kasoor", artist: "Amit Trivedi", movie: "AndhaDhun", language: "hindi", year: 2018, firstLetter: "N" },
  { id: 105, title: "Namo Namo", artist: "Amit Trivedi", movie: "Kedarnath", language: "hindi", year: 2018, firstLetter: "N" },
  { id: 106, title: "O Sanam", artist: "Lucky Ali", movie: "Single", language: "hindi", year: 1996, firstLetter: "O" },
  { id: 107, title: "Oh Oh Jaane Jaana", artist: "Kamaal Khan", movie: "Pyar Kiya To Darna Kya", language: "hindi", year: 1998, firstLetter: "O" },
  { id: 108, title: "Om Shanti Om", artist: "Kishore Kumar", movie: "Karz", language: "hindi", year: 1980, firstLetter: "O" },
  { id: 109, title: "O Mere Dil Ke Chain", artist: "Kishore Kumar", movie: "Mere Jeevan Saathi", language: "hindi", year: 1972, firstLetter: "O" },
  { id: 110, title: "Pehla Nasha", artist: "Udit Narayan", movie: "Jo Jeeta Wohi Sikandar", language: "hindi", year: 1992, firstLetter: "P" },
  { id: 111, title: "Pani Da Rang", artist: "Ayushmann Khurrana", movie: "Vicky Donor", language: "hindi", year: 2012, firstLetter: "P" },
  { id: 112, title: "Phir Bhi Tumko Chaahunga", artist: "Arijit Singh", movie: "Half Girlfriend", language: "hindi", year: 2017, firstLetter: "P" },
  { id: 113, title: "Pal Pal Dil Ke Paas", artist: "Kishore Kumar", movie: "Blackmail", language: "hindi", year: 1973, firstLetter: "P" },
  { id: 114, title: "Pareshaan", artist: "Shalmali Kholgade", movie: "Ishaqzaade", language: "hindi", year: 2012, firstLetter: "P" },
  { id: 115, title: "Piya Tu Ab To Aaja", artist: "Asha Bhosle", movie: "Caravan", language: "hindi", year: 1971, firstLetter: "P" },
  { id: 116, title: "Qaafirana", artist: "Arijit Singh", movie: "Kedarnath", language: "hindi", year: 2018, firstLetter: "Q" },
  { id: 117, title: "Qismat", artist: "Ammy Virk", movie: "Qismat", language: "hindi", year: 2018, firstLetter: "Q" },
  { id: 118, title: "Raabta", artist: "Arijit Singh", movie: "Agent Vinod", language: "hindi", year: 2012, firstLetter: "R" },
  { id: 119, title: "Roop Tera Mastana", artist: "Kishore Kumar", movie: "Aradhana", language: "hindi", year: 1969, firstLetter: "R" },
  { id: 120, title: "Rang De Basanti", artist: "Daler Mehndi", movie: "Rang De Basanti", language: "hindi", year: 2006, firstLetter: "R" },
  { id: 121, title: "Radha", artist: "Shreya Ghoshal", movie: "Student of the Year", language: "hindi", year: 2012, firstLetter: "R" },
  { id: 122, title: "Roja Jaaneman", artist: "S.P. Balasubrahmanyam", movie: "Roja", language: "hindi", year: 1992, firstLetter: "R" },
  { id: 123, title: "Raatan Lambiyan", artist: "Jubin Nautiyal", movie: "Shershaah", language: "hindi", year: 2021, firstLetter: "R" },
  { id: 124, title: "Roke Na Ruke Naina", artist: "Arijit Singh", movie: "Badrinath Ki Dulhania", language: "hindi", year: 2017, firstLetter: "R" },
  { id: 125, title: "Saajan", artist: "S.P. Balasubrahmanyam", movie: "Saajan", language: "hindi", year: 1991, firstLetter: "S" },
  { id: 126, title: "Sun Saathiya", artist: "Priya Saraiya", movie: "ABCD 2", language: "hindi", year: 2015, firstLetter: "S" },
  { id: 127, title: "Sheila Ki Jawani", artist: "Sunidhi Chauhan", movie: "Tees Maar Khan", language: "hindi", year: 2010, firstLetter: "S" },
  { id: 128, title: "Suraj Hua Maddham", artist: "Sonu Nigam", movie: "Kabhi Khushi Kabhie Gham", language: "hindi", year: 2001, firstLetter: "S" },
  { id: 129, title: "Saawariya", artist: "Arijit Singh", movie: "Single", language: "hindi", year: 2017, firstLetter: "S" },
  { id: 130, title: "Senorita", artist: "Farhan Akhtar", movie: "Zindagi Na Milegi Dobara", language: "hindi", year: 2011, firstLetter: "S" },
  { id: 131, title: "Swag Se Swagat", artist: "Vishal Dadlani", movie: "Tiger Zinda Hai", language: "hindi", year: 2017, firstLetter: "S" },
  { id: 132, title: "Soch Na Sake", artist: "Arijit Singh", movie: "Airlift", language: "hindi", year: 2016, firstLetter: "S" },
  { id: 133, title: "Suno Na Sangemarmar", artist: "Arijit Singh", movie: "Youngistaan", language: "hindi", year: 2014, firstLetter: "S" },
  { id: 134, title: "Saibo", artist: "Shreya Ghoshal", movie: "Shor in the City", language: "hindi", year: 2011, firstLetter: "S" },
  { id: 135, title: "Satisfya", artist: "Imran Khan", movie: "Single", language: "hindi", year: 2013, firstLetter: "S" },
  { id: 136, title: "Tujhe Dekha To", artist: "Kumar Sanu", movie: "Dilwale Dulhania Le Jayenge", language: "hindi", year: 1995, firstLetter: "T" },
  { id: 137, title: "Tum Hi Ho", artist: "Arijit Singh", movie: "Aashiqui 2", language: "hindi", year: 2013, firstLetter: "T" },
  { id: 138, title: "Tu Jaane Na", artist: "Atif Aslam", movie: "Ajab Prem Ki Ghazab Kahani", language: "hindi", year: 2009, firstLetter: "T" },
  { id: 139, title: "Teri Mitti", artist: "B Praak", movie: "Kesari", language: "hindi", year: 2019, firstLetter: "T" },
  { id: 140, title: "Tere Bina", artist: "A.R. Rahman", movie: "Guru", language: "hindi", year: 2007, firstLetter: "T" },
  { id: 141, title: "Tere Naam", artist: "Udit Narayan", movie: "Tere Naam", language: "hindi", year: 2003, firstLetter: "T" },
  { id: 142, title: "Tu Hi Re", artist: "Hariharan", movie: "Bombay", language: "hindi", year: 1995, firstLetter: "T" },
  { id: 143, title: "Tareefan", artist: "Badshah", movie: "Veere Di Wedding", language: "hindi", year: 2018, firstLetter: "T" },
  { id: 144, title: "Tera Ban Jaunga", artist: "Akhil Sachdeva", movie: "Kabir Singh", language: "hindi", year: 2019, firstLetter: "T" },
  { id: 145, title: "Tere Liye", artist: "Atif Aslam", movie: "Veer-Zaara", language: "hindi", year: 2004, firstLetter: "T" },
  { id: 146, title: "Ude Dil Befikre", artist: "Benny Dayal", movie: "Befikre", language: "hindi", year: 2016, firstLetter: "U" },
  { id: 147, title: "Urvashi", artist: "A.R. Rahman", movie: "Kadhalan", language: "hindi", year: 1994, firstLetter: "U" },
  { id: 148, title: "Udd Gaye", artist: "Ritviz", movie: "Single", language: "hindi", year: 2017, firstLetter: "U" },
  { id: 149, title: "Vajle Ki Bara", artist: "Ajay-Atul", movie: "Natrang", language: "hindi", year: 2010, firstLetter: "V" },
  { id: 150, title: "Ve Maahi", artist: "Arijit Singh", movie: "Kesari", language: "hindi", year: 2019, firstLetter: "V" },
  { id: 151, title: "Woh Ladki Hai Kahan", artist: "Udit Narayan", movie: "Dil Chahta Hai", language: "hindi", year: 2001, firstLetter: "W" },
  { id: 152, title: "Woh Lamhe", artist: "Atif Aslam", movie: "Zeher", language: "hindi", year: 2005, firstLetter: "W" },
  { id: 153, title: "Waada Raha Sanam", artist: "Mohammed Rafi", movie: "Khilona", language: "hindi", year: 1970, firstLetter: "W" },
  { id: 154, title: "Yeh Jawaani Hai Deewani", artist: "RDB", movie: "Yeh Jawaani Hai Deewani", language: "hindi", year: 2013, firstLetter: "Y" },
  { id: 155, title: "Yeh Ishq Hai", artist: "Shreya Ghoshal", movie: "Jab We Met", language: "hindi", year: 2007, firstLetter: "Y" },
  { id: 156, title: "Ye Mera Dil Pyar Ka Deewana", artist: "Asha Bhosle", movie: "Don", language: "hindi", year: 1978, firstLetter: "Y" },
  { id: 157, title: "Yeh Jo Des Hai Tera", artist: "A.R. Rahman", movie: "Swades", language: "hindi", year: 2004, firstLetter: "Y" },
  { id: 158, title: "Zaalima", artist: "Arijit Singh", movie: "Raees", language: "hindi", year: 2017, firstLetter: "Z" },
  { id: 159, title: "Zehnaseeb", artist: "Chinmayi", movie: "Hasee Toh Phasee", language: "hindi", year: 2014, firstLetter: "Z" },
  { id: 160, title: "Zara Zara Behekta Hai", artist: "Bombay Jayashri", movie: "Rehnaa Hai Terre Dil Mein", language: "hindi", year: 2001, firstLetter: "Z" },
  { id: 161, title: "Zingaat", artist: "Ajay-Atul", movie: "Dhadak", language: "hindi", year: 2018, firstLetter: "Z" },
  { id: 162, title: "Srivalli", artist: "Javed Ali", movie: "Pushpa", language: "hindi", year: 2021, firstLetter: "S" },
  { id: 163, title: "Naacho Naacho", artist: "Vishal Mishra", movie: "RRR", language: "hindi", year: 2022, firstLetter: "N" },
  { id: 164, title: "Tere Vaaste", artist: "Varun Jain", movie: "Zara Hatke Zara Bachke", language: "hindi", year: 2023, firstLetter: "T" },
  { id: 165, title: "Phir Aur Kya Chahiye", artist: "Arijit Singh", movie: "Zara Hatke Zara Bachke", language: "hindi", year: 2023, firstLetter: "P" },
  { id: 166, title: "Besharam Rang", artist: "Caralisa Monteiro", movie: "Pathaan", language: "hindi", year: 2023, firstLetter: "B" },
  { id: 167, title: "Tum Kya Mile", artist: "Arijit Singh", movie: "Rocky Aur Rani Kii Prem Kahaani", language: "hindi", year: 2023, firstLetter: "T" },
  { id: 168, title: "Sajni", artist: "Arijit Singh", movie: "Laapataa Ladies", language: "hindi", year: 2024, firstLetter: "S" },
  { id: 169, title: "Hauli Hauli", artist: "Garry Sandhu", movie: "De De Pyaar De", language: "hindi", year: 2019, firstLetter: "H" },
  { id: 170, title: "Genda Phool", artist: "Badshah", movie: "Single", language: "hindi", year: 2020, firstLetter: "G" },
  { id: 171, title: "Makhna", artist: "Tanishk Bagchi", movie: "Drive", language: "hindi", year: 2019, firstLetter: "M" },
  { id: 172, title: "Pachtaoge", artist: "Arijit Singh", movie: "Single", language: "hindi", year: 2019, firstLetter: "P" },
  { id: 173, title: "Rang Lageya", artist: "Mohit Chauhan", movie: "Single", language: "hindi", year: 2021, firstLetter: "R" },
  { id: 174, title: "Dil Bechara", artist: "A.R. Rahman", movie: "Dil Bechara", language: "hindi", year: 2020, firstLetter: "D" },
  { id: 175, title: "Shayad", artist: "Arijit Singh", movie: "Love Aaj Kal", language: "hindi", year: 2020, firstLetter: "S" },
  { id: 176, title: "Naina", artist: "Neha Kakkar", movie: "Dangal", language: "hindi", year: 2016, firstLetter: "N" },
  { id: 177, title: "Tujh Mein Rab Dikhta Hai", artist: "Roop Kumar Rathod", movie: "Rab Ne Bana Di Jodi", language: "hindi", year: 2008, firstLetter: "T" },
  { id: 178, title: "Aashiqui Aa Gayi", artist: "Arijit Singh", movie: "Radhe Shyam", language: "hindi", year: 2022, firstLetter: "A" },
  { id: 179, title: "Maan Meri Jaan", artist: "King", movie: "Single", language: "hindi", year: 2022, firstLetter: "M" },
  { id: 180, title: "Chaleya", artist: "Arijit Singh", movie: "Jawan", language: "hindi", year: 2023, firstLetter: "C" },
  { id: 181, title: "Jind Meriye", artist: "Arijit Singh", movie: "Single", language: "hindi", year: 2020, firstLetter: "J" },
  { id: 182, title: "Heeriye", artist: "Jasleen Royal", movie: "Single", language: "hindi", year: 2023, firstLetter: "H" },
  { id: 183, title: "O Rangrez", artist: "Shreya Ghoshal", movie: "Bhaag Milkha Bhaag", language: "hindi", year: 2013, firstLetter: "O" },
  { id: 184, title: "Tum Se Hi", artist: "Mohit Chauhan", movie: "Jab We Met", language: "hindi", year: 2007, firstLetter: "T" },
  { id: 185, title: "Dil Dhadakne Do", artist: "Priyanka Chopra", movie: "Dil Dhadakne Do", language: "hindi", year: 2015, firstLetter: "D" },
  { id: 186, title: "Mere Naam Tu", artist: "Abhay Jodhpurkar", movie: "Zero", language: "hindi", year: 2018, firstLetter: "M" },
  { id: 187, title: "Param Sundari", artist: "Shreya Ghoshal", movie: "Mimi", language: "hindi", year: 2021, firstLetter: "P" },
  { id: 188, title: "Namo Namo Shankaraa", artist: "Amit Trivedi", movie: "Kedarnath", language: "hindi", year: 2018, firstLetter: "N" },
  { id: 189, title: "Ghungroo Toot Jayenge", artist: "Arijit Singh", movie: "War", language: "hindi", year: 2019, firstLetter: "G" },
  { id: 190, title: "Kalank Title Track", artist: "Arijit Singh", movie: "Kalank", language: "hindi", year: 2019, firstLetter: "K" },
  { id: 191, title: "Lut Gaye", artist: "Jubin Nautiyal", movie: "Single", language: "hindi", year: 2021, firstLetter: "L" },
  { id: 192, title: "Satranga", artist: "Arijit Singh", movie: "Animal", language: "hindi", year: 2023, firstLetter: "S" },
  { id: 193, title: "Arjan Vailly", artist: "Bhupinder Babbal", movie: "Animal", language: "hindi", year: 2023, firstLetter: "A" },
  { id: 194, title: "Chikni Chameli", artist: "Shreya Ghoshal", movie: "Agneepath", language: "hindi", year: 2012, firstLetter: "C" },
  { id: 195, title: "Woh Dekhe Na Thi Kabhi", artist: "Sonu Nigam", movie: "Jaan-E-Mann", language: "hindi", year: 2006, firstLetter: "W" },
  { id: 196, title: "Yeh Dooriyan", artist: "Mohit Chauhan", movie: "Love Aaj Kal", language: "hindi", year: 2009, firstLetter: "Y" },
  { id: 197, title: "Jeena Jeena", artist: "Atif Aslam", movie: "Badlapur", language: "hindi", year: 2015, firstLetter: "J" },
  { id: 198, title: "Nazm Nazm", artist: "Arko", movie: "Bareilly Ki Barfi", language: "hindi", year: 2017, firstLetter: "N" },
  { id: 199, title: "Coca Cola Tu", artist: "Tony Kakkar", movie: "Luka Chuppi", language: "hindi", year: 2019, firstLetter: "C" },
  { id: 200, title: "First Class", artist: "Arijit Singh", movie: "Kalank", language: "hindi", year: 2019, firstLetter: "F" },

  // ── ENGLISH ──────────────────────────────────────────────
  { id: 201, title: "Shape of You", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2017, firstLetter: "S" },
  { id: 202, title: "Bohemian Rhapsody", artist: "Queen", movie: "Single", language: "english", year: 1975, firstLetter: "B" },
  { id: 203, title: "Let It Be", artist: "The Beatles", movie: "Single", language: "english", year: 1970, firstLetter: "L" },
  { id: 204, title: "Imagine", artist: "John Lennon", movie: "Single", language: "english", year: 1971, firstLetter: "I" },
  { id: 205, title: "Yesterday", artist: "The Beatles", movie: "Single", language: "english", year: 1965, firstLetter: "Y" },
  { id: 206, title: "Hotel California", artist: "Eagles", movie: "Single", language: "english", year: 1977, firstLetter: "H" },
  { id: 207, title: "Thriller", artist: "Michael Jackson", movie: "Single", language: "english", year: 1982, firstLetter: "T" },
  { id: 208, title: "Billie Jean", artist: "Michael Jackson", movie: "Single", language: "english", year: 1983, firstLetter: "B" },
  { id: 209, title: "Rolling in the Deep", artist: "Adele", movie: "Single", language: "english", year: 2010, firstLetter: "R" },
  { id: 210, title: "Someone Like You", artist: "Adele", movie: "Single", language: "english", year: 2011, firstLetter: "S" },
  { id: 211, title: "Hello", artist: "Adele", movie: "Single", language: "english", year: 2015, firstLetter: "H" },
  { id: 212, title: "Closer", artist: "The Chainsmokers", movie: "Single", language: "english", year: 2016, firstLetter: "C" },
  { id: 213, title: "Despacito", artist: "Luis Fonsi", movie: "Single", language: "english", year: 2017, firstLetter: "D" },
  { id: 214, title: "Uptown Funk", artist: "Bruno Mars", movie: "Single", language: "english", year: 2014, firstLetter: "U" },
  { id: 215, title: "Blinding Lights", artist: "The Weeknd", movie: "Single", language: "english", year: 2019, firstLetter: "B" },
  { id: 216, title: "Perfect", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2017, firstLetter: "P" },
  { id: 217, title: "Thinking Out Loud", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2014, firstLetter: "T" },
  { id: 218, title: "Stay With Me", artist: "Sam Smith", movie: "Single", language: "english", year: 2014, firstLetter: "S" },
  { id: 219, title: "Havana", artist: "Camila Cabello", movie: "Single", language: "english", year: 2017, firstLetter: "H" },
  { id: 220, title: "Photograph", artist: "Ed Sheeran", movie: "Single", language: "english", year: 2015, firstLetter: "P" },
  { id: 221, title: "Counting Stars", artist: "OneRepublic", movie: "Single", language: "english", year: 2013, firstLetter: "C" },
  { id: 222, title: "All of Me", artist: "John Legend", movie: "Single", language: "english", year: 2013, firstLetter: "A" },
  { id: 223, title: "Radioactive", artist: "Imagine Dragons", movie: "Single", language: "english", year: 2012, firstLetter: "R" },
  { id: 224, title: "Faded", artist: "Alan Walker", movie: "Single", language: "english", year: 2015, firstLetter: "F" },
  { id: 225, title: "Wake Me Up", artist: "Avicii", movie: "Single", language: "english", year: 2013, firstLetter: "W" },
  { id: 226, title: "Lean On", artist: "Major Lazer", movie: "Single", language: "english", year: 2015, firstLetter: "L" },
  { id: 227, title: "Dark Horse", artist: "Katy Perry", movie: "Single", language: "english", year: 2013, firstLetter: "D" },
  { id: 228, title: "Roar", artist: "Katy Perry", movie: "Single", language: "english", year: 2013, firstLetter: "R" },
  { id: 229, title: "Happy", artist: "Pharrell Williams", movie: "Despicable Me 2", language: "english", year: 2013, firstLetter: "H" },
  { id: 230, title: "Viva La Vida", artist: "Coldplay", movie: "Single", language: "english", year: 2008, firstLetter: "V" },
  { id: 231, title: "Fix You", artist: "Coldplay", movie: "Single", language: "english", year: 2005, firstLetter: "F" },
  { id: 232, title: "Believer", artist: "Imagine Dragons", movie: "Single", language: "english", year: 2017, firstLetter: "B" },
  { id: 233, title: "Thunder", artist: "Imagine Dragons", movie: "Single", language: "english", year: 2017, firstLetter: "T" },
  { id: 234, title: "Night Changes", artist: "One Direction", movie: "Single", language: "english", year: 2014, firstLetter: "N" },
  { id: 235, title: "Attention", artist: "Charlie Puth", movie: "Single", language: "english", year: 2017, firstLetter: "A" },
  { id: 236, title: "Old Town Road", artist: "Lil Nas X", movie: "Single", language: "english", year: 2019, firstLetter: "O" },
  { id: 237, title: "Levitating", artist: "Dua Lipa", movie: "Single", language: "english", year: 2020, firstLetter: "L" },
  { id: 238, title: "Dance Monkey", artist: "Tones and I", movie: "Single", language: "english", year: 2019, firstLetter: "D" },
  { id: 239, title: "Watermelon Sugar", artist: "Harry Styles", movie: "Single", language: "english", year: 2020, firstLetter: "W" },
  { id: 240, title: "Gangnam Style", artist: "PSY", movie: "Single", language: "english", year: 2012, firstLetter: "G" },
  { id: 241, title: "Bad Guy", artist: "Billie Eilish", movie: "Single", language: "english", year: 2019, firstLetter: "B" },
  { id: 242, title: "Señorita", artist: "Shawn Mendes", movie: "Single", language: "english", year: 2019, firstLetter: "S" },
  { id: 243, title: "Memories", artist: "Maroon 5", movie: "Single", language: "english", year: 2019, firstLetter: "M" },
  { id: 244, title: "Sunflower", artist: "Post Malone", movie: "Spider-Man: Into the Spider-Verse", language: "english", year: 2018, firstLetter: "S" },
  { id: 245, title: "Unstoppable", artist: "Sia", movie: "Single", language: "english", year: 2016, firstLetter: "U" },
  { id: 246, title: "Cheap Thrills", artist: "Sia", movie: "Single", language: "english", year: 2016, firstLetter: "C" },
  { id: 247, title: "Just the Way You Are", artist: "Bruno Mars", movie: "Single", language: "english", year: 2010, firstLetter: "J" },
  { id: 248, title: "Locked Out of Heaven", artist: "Bruno Mars", movie: "Single", language: "english", year: 2012, firstLetter: "L" },
  { id: 249, title: "Enemy", artist: "Imagine Dragons", movie: "Arcane", language: "english", year: 2021, firstLetter: "E" },
  { id: 250, title: "Flowers", artist: "Miley Cyrus", movie: "Single", language: "english", year: 2023, firstLetter: "F" },

  // ── TAMIL ────────────────────────────────────────────────
  { id: 251, title: "Roja Kaadhal Vandaal", artist: "S.P. Balasubrahmanyam", movie: "Roja", language: "tamil", year: 1992, firstLetter: "R" },
  { id: 252, title: "Munbe Vaa", artist: "Shreya Ghoshal", movie: "Sillunu Oru Kaadhal", language: "tamil", year: 2006, firstLetter: "M" },
  { id: 253, title: "Kannazhaga", artist: "Dhanush", movie: "3", language: "tamil", year: 2012, firstLetter: "K" },
  { id: 254, title: "Why This Kolaveri Di", artist: "Dhanush", movie: "3", language: "tamil", year: 2011, firstLetter: "W" },
  { id: 255, title: "Vaseegara", artist: "Bombay Jayashri", movie: "Minnale", language: "tamil", year: 2001, firstLetter: "V" },
  { id: 256, title: "Ennai Konjam", artist: "Sid Sriram", movie: "Kaatru Veliyidai", language: "tamil", year: 2017, firstLetter: "E" },
  { id: 257, title: "Oru Kadhal Devathai", artist: "Karthik", movie: "Kadhal Konden", language: "tamil", year: 2003, firstLetter: "O" },
  { id: 258, title: "Nenjukkul Peidhidum", artist: "Harris Jayaraj", movie: "Vaaranam Aayiram", language: "tamil", year: 2008, firstLetter: "N" },
  { id: 259, title: "Kadhal En Kadhal", artist: "Yuvan Shankar Raja", movie: "Mayakkam Enna", language: "tamil", year: 2011, firstLetter: "K" },
  { id: 260, title: "Aalaporan Thamizhan", artist: "A.R. Rahman", movie: "Mersal", language: "tamil", year: 2017, firstLetter: "A" },
  { id: 261, title: "Petta Theme", artist: "Anirudh Ravichander", movie: "Petta", language: "tamil", year: 2019, firstLetter: "P" },
  { id: 262, title: "Enjoy Enjaami", artist: "Dhee", movie: "Single", language: "tamil", year: 2021, firstLetter: "E" },
  { id: 263, title: "Vaathi Coming", artist: "Anirudh Ravichander", movie: "Master", language: "tamil", year: 2021, firstLetter: "V" },
  { id: 264, title: "Arabic Kuthu", artist: "Anirudh Ravichander", movie: "Beast", language: "tamil", year: 2022, firstLetter: "A" },
  { id: 265, title: "Ilamai Thirumudi", artist: "A.R. Rahman", movie: "Petta", language: "tamil", year: 2019, firstLetter: "I" },
  { id: 266, title: "Butta Bomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", language: "tamil", year: 2020, firstLetter: "B" },
  { id: 267, title: "Thalli Pogathey", artist: "Sid Sriram", movie: "Achcham Yenbadhu Madamaiyada", language: "tamil", year: 2016, firstLetter: "T" },
  { id: 268, title: "Enna Solla Pogirai", artist: "Sid Sriram", movie: "A.R. Rahman Concert", language: "tamil", year: 2020, firstLetter: "E" },
  { id: 269, title: "Sariyaaga Poidhale", artist: "Yuvan Shankar Raja", movie: "Iraivi", language: "tamil", year: 2016, firstLetter: "S" },
  { id: 270, title: "Dheevara", artist: "M.M. Keeravani", movie: "Baahubali", language: "tamil", year: 2015, firstLetter: "D" },

  // ── TELUGU ───────────────────────────────────────────────
  { id: 271, title: "Buttabomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "B" },
  { id: 272, title: "Samajavaragamana", artist: "Sid Sriram", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "S" },
  { id: 273, title: "Srivalli", artist: "Sid Sriram", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "S" },
  { id: 274, title: "Naatu Naatu", artist: "Rahul Sipligunj", movie: "RRR", language: "telugu", year: 2022, firstLetter: "N" },
  { id: 275, title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "R" },
  { id: 276, title: "Oo Antava Oo Oo Antava", artist: "Indravathi Chauhan", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "O" },
  { id: 277, title: "Komuram Bheemudo", artist: "Kaala Bhairava", movie: "RRR", language: "telugu", year: 2022, firstLetter: "K" },
  { id: 278, title: "Butta Bomma", artist: "Armaan Malik", movie: "Ala Vaikunthapurramuloo", language: "telugu", year: 2020, firstLetter: "B" },
  { id: 279, title: "Inkem Inkem Kavale", artist: "Sid Sriram", movie: "Geetha Govindam", language: "telugu", year: 2018, firstLetter: "I" },
  { id: 280, title: "Saami Saami", artist: "Mounika Yadav", movie: "Pushpa", language: "telugu", year: 2021, firstLetter: "S" },
  { id: 281, title: "Ekkadiki Pothav Chinnavada", artist: "Dhanunjay", movie: "Ekkadiki Pothav Chinnavada", language: "telugu", year: 2016, firstLetter: "E" },
  { id: 282, title: "Jaragandi", artist: "Anirudh Ravichander", movie: "Game Changer", language: "telugu", year: 2024, firstLetter: "J" },
  { id: 283, title: "Dheevara", artist: "M.M. Keeravani", movie: "Baahubali", language: "telugu", year: 2015, firstLetter: "D" },
  { id: 284, title: "Pilla Raa", artist: "Haricharan", movie: "RX 100", language: "telugu", year: 2018, firstLetter: "P" },
  { id: 285, title: "Arere Yekkada", artist: "S.P. Charan", movie: "Nenu Local", language: "telugu", year: 2017, firstLetter: "A" },

  // ── PUNJABI ──────────────────────────────────────────────
  { id: 286, title: "Mundian To Bach Ke", artist: "Panjabi MC", movie: "Single", language: "punjabi", year: 2002, firstLetter: "M" },
  { id: 287, title: "High Rated Gabru", artist: "Guru Randhawa", movie: "Single", language: "punjabi", year: 2017, firstLetter: "H" },
  { id: 288, title: "Lahore", artist: "Guru Randhawa", movie: "Single", language: "punjabi", year: 2017, firstLetter: "L" },
  { id: 289, title: "Brown Munde", artist: "AP Dhillon", movie: "Single", language: "punjabi", year: 2020, firstLetter: "B" },
  { id: 290, title: "Excuses", artist: "AP Dhillon", movie: "Single", language: "punjabi", year: 2021, firstLetter: "E" },
  { id: 291, title: "Suit Suit Karda", artist: "Guru Randhawa", movie: "Hindi Medium", language: "punjabi", year: 2017, firstLetter: "S" },
  { id: 292, title: "Proper Patola", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2018, firstLetter: "P" },
  { id: 293, title: "Raat Di Gedi", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2017, firstLetter: "R" },
  { id: 294, title: "Lover", artist: "Diljit Dosanjh", movie: "Single", language: "punjabi", year: 2022, firstLetter: "L" },
  { id: 295, title: "Naa Ji Naa", artist: "Hardy Sandhu", movie: "Single", language: "punjabi", year: 2013, firstLetter: "N" },
  { id: 296, title: "Jatt Da Muqabala", artist: "Sidhu Moose Wala", movie: "Single", language: "punjabi", year: 2018, firstLetter: "J" },
  { id: 297, title: "Ikk Kudi", artist: "Diljit Dosanjh", movie: "Udta Punjab", language: "punjabi", year: 2016, firstLetter: "I" },
  { id: 298, title: "Dil Luteya", artist: "Jazzy B", movie: "Single", language: "punjabi", year: 2009, firstLetter: "D" },
  { id: 299, title: "Amplifier", artist: "Imran Khan", movie: "Single", language: "punjabi", year: 2009, firstLetter: "A" },
  { id: 300, title: "Kya Baat Ay", artist: "Hardy Sandhu", movie: "Single", language: "punjabi", year: 2018, firstLetter: "K" },

  // ── BENGALI ──────────────────────────────────────────────
  { id: 301, title: "Tumi Jake Bhalobaso", artist: "Anupam Roy", movie: "Piku", language: "bengali", year: 2015, firstLetter: "T" },
  { id: 302, title: "Mon Majhi Re", artist: "Arijit Singh", movie: "Boss", language: "bengali", year: 2013, firstLetter: "M" },
  { id: 303, title: "Pagla Hawar Badol Dine", artist: "Nachiketa", movie: "Single", language: "bengali", year: 1994, firstLetter: "P" },
  { id: 304, title: "Ami Je Tomar", artist: "Arijit Singh", movie: "Bhool Bhulaiyaa 2", language: "bengali", year: 2022, firstLetter: "A" },
  { id: 305, title: "Keno Hotath Tumi", artist: "Anupam Roy", movie: "Single", language: "bengali", year: 2015, firstLetter: "K" },
  { id: 306, title: "Bela Bose", artist: "Anjan Dutt", movie: "Single", language: "bengali", year: 1993, firstLetter: "B" },
  { id: 307, title: "Ei Raat Tomar Amar", artist: "Hemanta Mukherjee", movie: "Deep Jwele Jai", language: "bengali", year: 1959, firstLetter: "E" },
  { id: 308, title: "Ghum Ghum", artist: "Anupam Roy", movie: "Chotoder Chobi", language: "bengali", year: 2014, firstLetter: "G" },
  { id: 309, title: "Ebar Bujhi Boley Dao", artist: "Nachiketa", movie: "Single", language: "bengali", year: 1995, firstLetter: "E" },
  { id: 310, title: "Ranjana Ami Ar Ashbona", artist: "Anjan Dutt", movie: "Single", language: "bengali", year: 1999, firstLetter: "R" },
];

export default songs;

/**
 * Normalize a string for search comparison
 */
function normalizeForSearch(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
}

/**
 * Simple similarity score between two strings (0-100)
 */
function getSimilarity(a, b) {
  const na = normalizeForSearch(a);
  const nb = normalizeForSearch(b);
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) {
    const ratio = Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
    return Math.round(70 + ratio * 30);
  }
  // Token overlap
  const tokensA = na.split(/\s+/);
  const tokensB = nb.split(/\s+/);
  let matches = 0;
  for (const t of tokensA) {
    if (tokensB.some(tb => tb.includes(t) || t.includes(tb))) matches++;
  }
  if (tokensA.length > 0) {
    return Math.round((matches / Math.max(tokensA.length, tokensB.length)) * 80);
  }
  return 0;
}

/**
 * Search songs by title (fuzzy match)
 * @param {string} query
 * @param {number} limit
 * @returns {Array}
 */
export function searchSongs(query, limit = 10) {
  if (!query || !query.trim()) return [];
  const q = normalizeForSearch(query);
  return songs
    .map(song => ({ ...song, score: getSimilarity(song.title, query) }))
    .filter(s => s.score > 30)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get songs starting with a specific letter
 * @param {string} letter
 * @returns {Array}
 */
export function getSongsByLetter(letter) {
  if (!letter) return [];
  return songs.filter(s => s.firstLetter === letter.toUpperCase());
}

/**
 * Get songs by language
 * @param {string} language
 * @returns {Array}
 */
export function getSongsByLanguage(language) {
  return songs.filter(s => s.language === language.toLowerCase());
}

/**
 * Get songs by artist
 * @param {string} artist
 * @returns {Array}
 */
export function getSongsByArtist(artist) {
  const q = normalizeForSearch(artist);
  return songs.filter(s => normalizeForSearch(s.artist).includes(q));
}

/**
 * Check if a song exists in database (fuzzy match)
 * @param {string} title
 * @returns {{ found: boolean, match: Object|null, confidence: number }}
 */
export function findSongMatch(title) {
  if (!title) return { found: false, match: null, confidence: 0 };
  let best = null;
  let bestScore = 0;
  for (const song of songs) {
    const score = getSimilarity(song.title, title);
    if (score > bestScore) {
      bestScore = score;
      best = song;
    }
  }
  return {
    found: bestScore >= 70,
    match: bestScore >= 50 ? best : null,
    confidence: bestScore,
  };
}

/**
 * Get a random song
 * @returns {Object}
 */
export function getRandomSong() {
  return songs[Math.floor(Math.random() * songs.length)];
}

/**
 * Get all unique artists
 * @returns {string[]}
 */
export function getAllArtists() {
  return [...new Set(songs.map(s => s.artist))].sort();
}

/**
 * Get all unique languages
 * @returns {string[]}
 */
export function getAllLanguages() {
  return [...new Set(songs.map(s => s.language))].sort();
}

/**
 * Get random letter that has songs
 * @returns {string}
 */
export function getRandomLetterWithSongs() {
  const letters = [...new Set(songs.map(s => s.firstLetter))];
  return letters[Math.floor(Math.random() * letters.length)];
}
