-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: pvp
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `cars`
--

DROP TABLE IF EXISTS `cars`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `brand` varchar(45) DEFAULT NULL,
  `model` varchar(45) DEFAULT NULL,
  `license_plate` varchar(45) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `fuel_efficiency` double DEFAULT NULL,
  `fuel_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `cars_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cars`
--

LOCK TABLES `cars` WRITE;
/*!40000 ALTER TABLE `cars` DISABLE KEYS */;
INSERT INTO `cars` VALUES (11,'BMW','X1','AAA111',13,9,'Electric'),(12,'OPEL','Sintra','JZR771',17,12,'Diesel');
/*!40000 ALTER TABLE `cars` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destinations`
--

DROP TABLE IF EXISTS `destinations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `destinations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `place_name` varchar(256) NOT NULL,
  `latitude` double NOT NULL,
  `longitude` double NOT NULL,
  `date` datetime NOT NULL,
  `user_id` int NOT NULL,
  `co2_emission` double DEFAULT NULL,
  `default_car` tinyint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `destination_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destinations`
--

LOCK TABLES `destinations` WRITE;
/*!40000 ALTER TABLE `destinations` DISABLE KEYS */;
INSERT INTO `destinations` VALUES (1,'Vilnius',54.6872,25.2797,'2025-03-26 17:31:38',8,NULL,NULL),(2,'Vilnius',54.6872,25.2797,'2025-03-26 17:32:01',8,NULL,NULL),(3,'Vilnius',54.6872,25.2797,'2025-03-26 19:30:00',9,NULL,NULL),(4,'Eiguliai, Kaunas, Lithuania',54.928171,23.932916,'2025-03-27 15:47:02',8,NULL,NULL),(5,'Kauno G., Zarasai 32135, Zarasai, Lithuania',55.718495,26.231947,'2025-03-27 15:48:04',8,NULL,NULL),(6,'Marijampolė, Marijampolė, Lithuania',54.556824,23.34933,'2025-03-27 15:48:41',8,NULL,NULL),(7,'Kaunas District, Lithuania',54.962064,23.774047,'2025-03-27 15:49:27',8,NULL,NULL),(8,'Custom marker',54.9328315397976,23.983900237826393,'2025-03-27 15:50:00',8,NULL,NULL),(9,'Custom marker',54.9328315397976,23.983900237826393,'2025-03-27 15:53:09',8,NULL,NULL),(10,'Pasvalys, Pasvalys, Lithuania',56.061657,24.399937,'2025-03-27 16:06:25',13,NULL,NULL),(11,'Custom marker',54.93573860947757,23.863028638443993,'2025-03-27 16:17:58',13,NULL,NULL),(12,'Custom marker',54.91524568322449,23.868812387924645,'2025-03-27 16:17:59',13,NULL,NULL),(13,'Custom marker',54.901396749366434,23.87379784421948,'2025-03-27 16:18:56',13,NULL,NULL),(14,'Custom marker',54.91524568322449,23.868812387924645,'2025-03-27 16:19:04',13,NULL,NULL),(15,'Custom marker',54.90949537827956,23.919800168590324,'2025-03-27 16:38:13',13,NULL,NULL),(16,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-03-27 16:38:36',13,NULL,NULL),(17,'Pasvalys, Pasvalys, Lithuania',56.061657,24.399937,'2025-03-27 16:38:53',13,NULL,NULL),(18,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-03-27 18:11:11',13,NULL,NULL),(19,'Custom marker',54.936324010249336,23.914804323247814,'2025-03-27 18:11:14',13,NULL,NULL),(20,'Custom marker',54.936324010249336,23.914804323247814,'2025-03-27 18:11:16',13,NULL,NULL),(21,'Custom marker',54.91013667041571,23.9163996474518,'2025-03-27 18:40:18',13,NULL,NULL),(22,'Custom marker',54.92208112944947,23.883034473918908,'2025-03-27 18:40:23',13,NULL,NULL),(23,'Custom marker',54.914190499395936,23.938482610748725,'2025-03-27 18:40:27',13,NULL,NULL),(24,'Custom marker',54.91943035312218,23.950727723586606,'2025-03-27 18:40:32',13,NULL,NULL),(25,'Custom marker',55.89715728834472,21.334984285042438,'2025-03-27 18:40:43',13,NULL,NULL),(26,'Custom marker',54.89923211064474,23.874231770865443,'2025-03-27 18:40:53',13,NULL,NULL),(27,'Custom marker',54.897971076320474,23.877976828562563,'2025-03-27 18:41:00',13,NULL,NULL),(28,'Custom marker',54.89846308405908,23.88471110392482,'2025-03-27 18:41:05',13,NULL,NULL),(29,'Custom marker',54.84521894993328,24.03201569744153,'2025-03-27 18:41:57',13,NULL,NULL),(30,'Custom marker',54.96261223609793,23.808510412444008,'2025-03-27 18:42:15',13,NULL,NULL),(31,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-03-27 19:36:08',13,NULL,NULL),(32,'Custom marker',54.89018939026699,23.977714513071717,'2025-03-28 11:17:43',15,NULL,NULL),(33,'Eiguliai, Kaunas, Lithuania',54.928171,23.932916,'2025-03-28 11:18:02',15,NULL,NULL),(34,'Custom marker',54.920329616600135,23.982120717253114,'2025-03-28 11:18:26',15,NULL,NULL),(35,'Custom marker',54.927027836190085,23.960045657491982,'2025-03-28 11:18:43',15,NULL,NULL),(36,'Custom marker',54.901220594286755,23.977767735143722,'2025-03-28 11:23:18',15,NULL,NULL),(37,'Custom marker',54.90116120193105,23.982436801973858,'2025-03-28 11:23:32',15,NULL,NULL),(38,'Custom marker',54.89112368035997,23.97697833183785,'2025-03-28 11:23:35',15,NULL,NULL),(39,'Custom marker',54.89589437986046,23.97705083224615,'2025-03-28 11:42:36',13,NULL,NULL),(40,'Custom marker',54.92717001683702,23.980234821498286,'2025-03-28 12:09:30',13,NULL,NULL),(41,'Studentų G. 5, Kaunas 50246, Lithuania',54.910934,23.946305,'2025-03-28 12:09:50',13,NULL,NULL),(42,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-03-30 17:33:52',13,NULL,NULL),(43,'Custom marker',54.914653693101386,23.883053960380114,'2025-04-01 12:52:06',13,18.48,NULL),(44,'Custom marker',54.94107634392022,23.924279379185613,'2025-04-01 12:53:53',13,18.48,NULL),(45,'Custom marker',54.912536075244084,23.910335187146497,'2025-04-01 12:55:06',13,18.48,1),(46,'Custom marker',54.915974062092445,23.895468711280046,'2025-04-01 12:56:45',13,18.48,1),(47,'Custom marker',54.930615223562725,23.919555426641267,'2025-04-01 12:59:33',13,18.48,1),(48,'Custom marker',54.91374782998582,23.91266327649906,'2025-04-01 13:02:01',13,18.48,1),(49,'Custom marker',54.9251601936288,23.929209938014466,'2025-04-01 13:02:18',13,18.48,1),(50,'Custom marker',54.94232984933233,23.926183696127325,'2025-04-01 13:02:25',13,18.48,1),(51,'Custom marker',54.9060612090178,23.922908593104886,'2025-04-01 13:04:02',13,18.48,1),(52,'Custom marker',54.92404815822806,23.909341843287184,'2025-04-01 13:06:07',13,18.48,1),(53,'Custom marker',54.93439173055919,23.927863007350908,'2025-04-01 13:06:08',13,18.48,1),(54,'Custom marker',54.94194840989883,23.90881976956103,'2025-04-01 13:08:12',13,18.48,1),(55,'Custom marker',54.91708444084889,23.918427540254363,'2025-04-01 13:08:20',13,18.48,1),(56,'Custom marker',54.90434812166442,23.898089530461956,'2025-04-01 13:08:22',13,18.48,1),(57,'Custom marker',54.93255179940792,23.93054463785846,'2025-04-01 13:08:23',13,18.48,1),(58,'Custom marker',54.93263124409924,23.91677832301629,'2025-04-01 13:12:37',13,18.48,1),(59,'Custom marker',54.919346904337445,23.918788449248137,'2025-04-01 13:13:32',13,6.93,0),(60,'Custom marker',54.941577266138275,23.916423687202823,'2025-04-01 13:14:05',13,16.17,0),(61,'Custom marker',54.90973562272529,23.887536133943605,'2025-04-01 13:14:07',13,16.17,0),(62,'Custom marker',54.91909299246773,23.899438401057772,'2025-04-01 13:15:09',13,18.48,1),(63,'Custom marker',54.93541193020519,23.91874174465428,'2025-04-01 13:18:32',13,8.778,0),(64,'Custom marker',54.94258174021288,23.912836603706534,'2025-04-01 13:20:24',13,8.778,0),(65,'Custom marker',54.91989770910387,23.884116090567574,'2025-04-01 13:20:25',13,8.778,0),(66,'Custom marker',54.92885193163722,23.9094151786147,'2025-04-01 13:21:10',13,8.778,0),(67,'Custom marker',54.93694956463119,23.92999100992188,'2025-04-01 13:21:11',13,8.778,0),(68,'Custom marker',54.909048324243855,23.929824018105656,'2025-04-01 13:21:16',13,8.778,0),(69,'Custom marker',54.920642572125594,23.91515844046965,'2025-04-01 13:24:59',13,8.778,0),(70,'Custom marker',54.920642572125594,23.91515844046965,'2025-04-01 13:25:00',13,8.778,0),(71,'Custom marker',54.92712587816865,23.870727209958787,'2025-04-01 13:25:25',13,8.778,0),(72,'Custom marker',54.92466105687753,23.875716876553845,'2025-04-01 13:25:27',13,8.778,0),(73,'Custom marker',54.90542785562206,23.87151942726749,'2025-04-01 13:25:32',13,8.778,0),(74,'Custom marker',54.90542785562206,23.87151942726749,'2025-04-01 13:25:38',13,8.778,0),(75,'Custom marker',54.924544108367044,23.86340188722436,'2025-04-01 13:25:40',13,8.778,0),(76,'Custom marker',54.926505920354145,23.86418972879748,'2025-04-01 13:25:41',13,8.778,0),(77,'Custom marker',54.926505920354145,23.86418972879748,'2025-04-01 13:25:43',13,8.778,0),(78,'Custom marker',54.92776667409273,23.907597694372214,'2025-04-01 13:26:10',13,8.778,0),(79,'Custom marker',54.934958939294056,23.912149666570382,'2025-04-01 13:26:11',13,8.778,0),(80,'Custom marker',54.934958939294056,23.912149666570382,'2025-04-01 13:26:14',13,8.778,0),(81,'Custom marker',54.92612336187102,23.863440899818517,'2025-04-01 13:26:16',13,8.778,0),(82,'Custom marker',54.931605918911714,23.859851842427247,'2025-04-01 13:26:17',13,8.778,0),(83,'Custom marker',54.931605918911714,23.859851842427247,'2025-04-01 13:26:18',13,8.778,0),(84,'Custom marker',54.91822692774109,23.86519856410693,'2025-04-01 13:26:20',13,8.778,0),(85,'Custom marker',54.917270989221954,23.875265431324355,'2025-04-01 13:26:21',13,8.778,0),(86,'Custom marker',54.917270989221954,23.875265431324355,'2025-04-01 13:26:23',13,8.778,0),(87,'Custom marker',54.94221953655544,23.880696447850642,'2025-04-01 13:26:25',13,8.778,0),(88,'Custom marker',54.93543089420263,23.92070129484804,'2025-04-01 13:26:27',13,8.778,0),(89,'Custom marker',54.93543089420263,23.92070129484804,'2025-04-01 13:26:29',13,8.778,0),(90,'Custom marker',54.902694938760014,23.88470058000707,'2025-04-01 13:26:56',13,8.778,0),(91,'Custom marker',54.92337541573708,23.907375158727405,'2025-04-01 13:27:00',13,8.778,0),(92,'Custom marker',54.92337541573708,23.907375158727405,'2025-04-01 13:27:31',13,8.778,0),(93,'Custom marker',54.92459522399481,23.86874801132209,'2025-04-01 13:27:34',13,8.778,0),(94,'Custom marker',54.92459522399481,23.86874801132209,'2025-04-01 13:27:36',13,8.778,0),(95,'Custom marker',54.92826725008257,23.91225437538687,'2025-04-01 13:27:40',13,8.778,0),(96,'Custom marker',54.92826725008257,23.91225437538687,'2025-04-01 13:27:42',13,8.778,0),(97,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-01 13:31:29',13,8.778,0),(98,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-01 13:31:54',13,18.48,1),(99,'Custom marker',54.93041012113785,23.924736165295855,'2025-04-01 13:32:06',13,18.48,1),(100,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-01 13:32:16',13,18.48,1),(101,'J. Skvirecko G. 24, Kaunas 47112, Lithuania',54.92925236963046,23.862895550361465,'2025-04-02 12:52:28',13,18.48,1),(102,'Megos Sankryžos Jungiamasis Kelias, Kaunas 47446, Lithuania',54.93961247677811,23.88679343312041,'2025-04-02 12:52:32',13,18.48,1),(103,'Megos Sankryžos Jungiamasis Kelias, Kaunas 47446, Lithuania',54.93961247677811,23.88679343312041,'2025-04-02 12:52:34',13,18.48,1),(104,'Žeimenos G. 80, Kaunas 49327, Lithuania',54.92488321122849,23.922275061999038,'2025-04-02 12:52:57',13,18.48,1),(105,'J. Grušo G. 22a, Kaunas 48265, Lithuania',54.927886589669754,23.89432318132847,'2025-04-02 12:53:03',13,18.48,1),(106,'Rietavo G. 15, Kaunas 48264, Lithuania',54.92779895417423,23.893763509624534,'2025-04-02 12:53:05',13,18.48,1),(107,'Rietavo G. 15, Kaunas 48264, Lithuania',54.92760743610414,23.893756895727535,'2025-04-02 12:53:07',13,18.48,1),(108,'Pienių G. 18, Kaunas 47446, Lithuania',54.94207550272481,23.885743655051037,'2025-04-02 12:54:05',13,18.48,1),(109,'Aknystos G. 8, Kaunas 48199, Lithuania',54.9260340092553,23.874272518844737,'2025-04-02 12:54:31',13,18.48,1),(110,'Apuolės G. 60c, Kaunas 48306, Lithuania',54.91662638607925,23.886615378316613,'2025-04-02 12:54:33',13,18.48,1),(111,'Baltų Pr. 1, Kaunas 48119, Lithuania',54.92773111838391,23.900734478620492,'2025-04-02 12:54:49',13,18.48,1),(112,'Narupės G. 100, Lapės 54400, Kaunas District, Lithuania',55.02907371293152,24.010429908183138,'2025-04-02 12:54:55',13,18.48,1),(113,'55381, Žeimiai, Jonava, Lithuania',55.19440256479034,24.128695701767285,'2025-04-02 12:55:00',13,18.48,1),(114,'60482, Raseinių, Raseiniai, Lithuania',55.385864227071245,23.56812442382476,'2025-04-02 12:55:03',13,18.48,1),(115,'Guobų G. 9, Panevėžys 37451, Lithuania',55.763515265983244,24.35697797671958,'2025-04-02 12:55:10',13,18.48,1),(116,'Dagiliškių G. 6, Pasvalys 39199, Pasvalys, Lithuania',56.02194534698236,24.35513048767515,'2025-04-02 12:55:40',13,18.48,1),(117,'Dagiliškių G. 8, Pasvalys 39199, Pasvalys, Lithuania',56.02207402742324,24.3544123452743,'2025-04-02 12:55:42',13,18.48,1),(118,'Nemuno Krant., Kaunas 45287, Lithuania',54.86320915836171,23.9313124074096,'2025-04-02 12:55:56',13,18.48,1),(119,'M. K. Čiurlionio G. 16, Kaunas 44362, Lithuania',54.88645718060979,23.931562754222494,'2025-04-02 12:56:03',13,18.48,1),(120,'M. K. Čiurlionio G. 16, Kaunas 44362, Lithuania',54.88645718060979,23.931562754222494,'2025-04-02 12:56:07',13,18.48,1),(121,'Tilžės G., Kaunas 47183, Lithuania',54.90406249485052,23.882538195129168,'2025-04-02 12:56:12',13,18.48,1),(122,'Lentainių G. 13a, Kaunas 47492, Lithuania',54.956474966274335,23.91130847702404,'2025-04-02 12:57:13',13,18.48,1),(123,'Panerių G. 311, Kaunas 44109, Lithuania',54.94182774346744,23.91593636781293,'2025-04-02 12:57:18',13,18.48,1),(124,'Kleboniškio G. 1e, Kaunas 44109, Lithuania',54.94886673256811,23.921969651639028,'2025-04-02 12:58:33',13,18.48,1),(125,'Tekmės G. 6, Kaunas 47488, Lithuania',54.94459303700584,23.906986280155195,'2025-04-02 12:59:02',13,18.48,1),(126,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-02 12:59:19',13,18.48,1),(127,'Rytmečio G. 27, Lapės 54432, Kaunas District, Lithuania',54.986884338001296,23.957517448266117,'2025-04-02 13:06:36',13,18.48,1),(128,'Panerių G. 309, Kaunas 47486, Lithuania',54.94092690081472,23.909757135720444,'2025-04-02 13:06:36',13,18.48,1),(129,'J. Lukšos-Daumanto G. 24, Kaunas 50103, Lithuania',54.92272009227925,23.921749845543292,'2025-04-02 13:06:39',13,18.48,1),(130,'Panerių G. 315, Kaunas 44109, Lithuania',54.94354156565389,23.915096955276276,'2025-04-02 13:06:40',13,18.48,1),(131,'Islandijos Pl., Kaunas 44105, Lithuania',54.93788784536923,23.924023191928402,'2025-04-02 13:08:50',13,18.48,1),(132,'Žeimenos G. 90, Kaunas 49327, Lithuania',54.92657156549,23.921747199755576,'2025-04-02 13:08:51',13,18.48,1),(133,'Kuršių G. 5, Kaunas 48109, Lithuania',54.93739822990694,23.887916524931054,'2025-04-02 13:09:58',13,18.48,1),(134,'Vandžiogalos Pl. 108, Domeikava 54359, Kaunas District, Lithuania',54.956911460820606,23.90107377761059,'2025-04-02 13:10:02',13,18.48,1),(135,'Kleboniškio G. 1e, Kaunas 44109, Lithuania',54.946439303211164,23.917737013763325,'2025-04-02 13:10:26',13,18.48,1),(136,'Neries Krant. 26a, Kaunas 48485, Lithuania',54.91692832444992,23.908447224557825,'2025-04-02 13:33:10',13,0.41293615440000003,1),(137,'Pikulo G. 6, Kaunas 48308, Lithuania',54.91778520274587,23.892771791070594,'2025-04-02 13:33:34',13,1.073212566,0),(138,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-02 13:33:54',13,2.807585688,0),(139,'Kareivinių G. 4, Klaipeda City 92253, Lithuania',55.72002380679844,21.12335519341881,'2025-04-02 13:35:03',13,50.85981647280001,0),(140,'Studentų G. 50, Kaunas 51368, Lithuania',54.903791,23.957695,'2025-04-02 13:35:17',13,1.6845369408000002,0),(141,'Ryšių G. 8, Kaunas 51308, Lithuania',54.910919085795015,23.957421428672706,'2025-04-02 13:35:34',13,1.1571331464,1),(142,'V. Landsbergio-Žemkalnio G., Kaunas 49295, Lithuania',54.928365,23.956121,'2025-04-03 21:29:49',20,2.0217467424,1);
/*!40000 ALTER TABLE `destinations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `party`
--

DROP TABLE IF EXISTS `party`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `party` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `active` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `party`
--

LOCK TABLES `party` WRITE;
/*!40000 ALTER TABLE `party` DISABLE KEYS */;
INSERT INTO `party` VALUES (1,20,1),(2,20,1),(3,20,1),(4,20,1),(5,20,1),(6,20,1),(7,20,1),(8,20,1),(9,20,1),(10,20,1),(11,20,1),(12,20,1),(13,20,1),(14,20,1),(15,20,1),(16,20,1);
/*!40000 ALTER TABLE `party` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `party_members`
--

DROP TABLE IF EXISTS `party_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `party_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `party_id` int NOT NULL,
  `accepted` tinyint NOT NULL DEFAULT '0',
  `user_id` int NOT NULL,
  `role` varchar(45) NOT NULL DEFAULT 'passenger',
  PRIMARY KEY (`id`),
  KEY `user_id_idx` (`user_id`),
  KEY `party_id_idx` (`party_id`),
  CONSTRAINT `fk_party_id` FOREIGN KEY (`party_id`) REFERENCES `party` (`id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `party_members`
--

LOCK TABLES `party_members` WRITE;
/*!40000 ALTER TABLE `party_members` DISABLE KEYS */;
INSERT INTO `party_members` VALUES (1,1,1,20,'driver'),(2,1,1,20,'driver'),(3,1,1,20,'driver'),(4,1,1,20,'driver'),(5,1,1,20,'driver'),(6,9,1,20,'driver'),(7,10,1,20,'driver'),(8,11,1,20,'driver'),(9,12,1,20,'driver'),(10,13,1,20,'driver'),(11,14,1,20,'driver'),(12,14,0,17,'passenger'),(13,14,0,19,'passenger'),(14,14,0,26,'passenger'),(15,15,1,20,'driver'),(16,15,0,17,'passenger'),(17,15,0,19,'passenger'),(18,15,0,26,'passenger'),(19,16,1,20,'driver'),(20,16,0,17,'passenger'),(21,16,0,19,'passenger'),(22,16,0,26,'passenger'),(23,16,0,27,'passenger');
/*!40000 ALTER TABLE `party_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `other_user_id` int NOT NULL,
  `liked` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
INSERT INTO `user_preferences` VALUES (1,20,27,1),(2,20,17,1),(3,20,19,1),(4,20,26,1);
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_work_times`
--

DROP TABLE IF EXISTS `user_work_times`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_work_times` (
  `id_user_work_times` int NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `day` varchar(45) NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id_user_work_times`),
  KEY `id_idx` (`user_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_work_times`
--

LOCK TABLES `user_work_times` WRITE;
/*!40000 ALTER TABLE `user_work_times` DISABLE KEYS */;
INSERT INTO `user_work_times` VALUES (1,'00:00:09','00:00:10','Monday',4),(2,'09:00:00','17:00:00','Tuesday',4),(3,'09:30:00','17:00:00','Tuesday',3),(4,'08:30:00','14:30:00','Monday',5),(6,'14:09:00','14:09:00','Sunday',5),(7,'11:00:00','12:00:00','Monday',6),(9,'10:50:00','10:50:00','Monday',7),(10,'13:45:00','20:45:00','Tuesday',7),(34,'16:15:00','21:00:00','Monday',15),(38,'09:00:00','17:00:00','Monday',13),(39,'09:00:00','17:00:00','Tuesday',13),(40,'10:00:00','17:00:00','Wednesday',13),(41,'09:00:00','17:00:00','Thursday',13),(42,'09:00:00','18:00:00','Friday',13);
/*!40000 ALTER TABLE `user_work_times` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `useraddresses`
--

DROP TABLE IF EXISTS `useraddresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `useraddresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `work_address` varchar(256) NOT NULL,
  `home_address` varchar(256) NOT NULL,
  `user_id` int NOT NULL,
  `work_lat` decimal(10,8) NOT NULL,
  `work_lon` decimal(10,8) NOT NULL,
  `home_lat` decimal(10,8) NOT NULL,
  `home_lon` decimal(10,8) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `useraddresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `useraddresses`
--

LOCK TABLES `useraddresses` WRITE;
/*!40000 ALTER TABLE `useraddresses` DISABLE KEYS */;
INSERT INTO `useraddresses` VALUES (5,'Ukmergės G., Utena 28138, Utena, Lithuania','Pašilės G. 37, Ukmergė 20191, Ukmergė, Lithuania',15,0.00000000,0.00000000,0.00000000,0.00000000),(6,'Studentų G. 50, Kaunas 51368, Lithuania','V. Landsbergio-Žemkalnio G. 8, Kaunas 49295, Lithuania',17,54.90379100,23.95769500,54.92799000,23.95676800),(7,'Studentų G. 50, Kaunas 51368, Lithuania','V. Krėvės Pr. 13, Kaunas 49488, Lithuania',19,54.90379100,23.95769500,54.91618100,23.96087800),(8,'Studentų G. 50, Kaunas 51368, Lithuania','Baltų Pr. 149, Kaunas 47124, Lithuania',20,54.90379100,23.95769500,54.92052900,23.86776300),(9,'Studentų G. 50, Kaunas 51368, Lithuania','V. Krėvės Pr. 13, Kaunas 49488, Lithuania',27,54.90379100,23.95769500,54.91618100,23.96087800),(10,'Studentų G. 50, Kaunas 51368, Lithuania','Baltų Pr. 149, Kaunas 47124, Lithuania',26,54.90379100,23.95769500,54.92052900,23.86776300);
/*!40000 ALTER TABLE `useraddresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `imagePath` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'jonas','RzKH+CmNunFjqJeQiVj3wOrnM+JdLgJ5kuou3JvtL6g=',NULL),(4,'string','RzKH+CmNunFjqJeQiVj3wOrnM+JdLgJ5kuou3JvtL6g=',NULL),(5,'dzonas','$2a$11$DTswR33qCpAZEUWJNqKPsOJTGtAW.ngJRwb.DB30i2RmZtqi7m.OK',NULL),(6,'antanas','$2a$11$ZhhcdQ1z8oHCz4Va9JCadO9gC1b0dUHkcb5BpqoDsEibPnTJ9hzU2',NULL),(7,'matas','$2a$11$CczdNlqoYsVzVkVrlVMDgOHfyaHjZBbULyj7M9RbvvVQOAelmKVge',NULL),(11,'petras','$2a$11$tFt8yobPgr6K3o.dYwq8c.R3lA4gLLcsV8Nmzk0K0ty11GzNMKAsm',NULL),(13,'TestUser','$2a$11$dSaqpA5dQg6bjfC6JqMlVeFpdA1Mstx.r7DbqaIUbS9OMi4eVyUCa',NULL),(14,'AntanasBaranauskas','$2a$11$R16Imus9ysG/jUHklCAKPeKBfihjx7XqMpmJJZCXgDEOk6VJagsme',NULL),(15,'PvzPvz123','$2a$11$VW.ZTQIzsJE0H9eTf2XlMOP/QRala6kF87GnrQcdxm0QEvlXA.c5S',NULL),(17,'saras','$2a$11$NiBHZ8JwtheNmTjrmRbGn.3F/X1.YuU0EVhVHHkeaiUY7VspCg796',''),(18,'antras','$2a$11$eWtASqolrZoFhPlMwgKi7OdQJw0uvPBRuCIp/uVbo3tJ8Of/2/Ydu',NULL),(19,'asd','$2a$11$xxitusvc5kH9fV7g/qrEmugHYcY3QqSiWTnbILVs6ojwOo26Bbr9m','http://192.168.1.108:5125/uploads/e54a3215-5502-4b39-8f88-427d42ea7e2f.PNG'),(20,'naujas','$2a$11$/8sAexdeRx9MXfSf4mSoWuf2iG9nTZ5lPvO7S8jYwnfND2k5e4NvG',NULL),(21,'gabija','$2a$11$3eSM.mVURLKdFBXxi9bO3uHiUXVziNFMg6TkoIdTRnr4iArBnMtby',NULL),(22,'gabija1','$2a$11$JBiQD3bas7zGYiqthiA8yO0h0D7mnsy2crqyYkINXvuV8O8BIwe92',NULL),(23,'gabija2','$2a$11$DIubwiRfWNORNBxX2CX/Puw4bJSiWJhg7v70LVTuz3epo0e5Jhy5u',NULL),(24,'haris','$2a$11$rKa2FzTPgO4X/rCxATVt6OBd2/WAXMTUil.GZfI8vPUyc/i9IyutG',NULL),(25,'jibat','$2a$11$e5npLUvY9NlC16UVU0Ow5ebsxGzCY7cnMlTszkwSswAh89b3I43xy',NULL),(26,'baton','$2a$11$rIeHB7PazUjO2hDuichW0uOI9J5ot73U0orYiJMB2S.VKBCFAN5ja','http://192.168.1.108:5125/uploads/2abc577c-3122-423a-8065-d341e0d9a1bf.jpg'),(27,'niam','$2a$11$xCp45B8CL0B6sOHo6LBcz.9Bgapi4Ub/D4OI5h4FLGWxdyKulWu76','http://192.168.1.108:5125/uploads/ff32f669-c7ae-4b93-8670-8520b347c02a.jpg');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-11  1:14:58
