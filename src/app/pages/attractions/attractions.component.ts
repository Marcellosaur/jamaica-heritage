import { Component } from '@angular/core';

interface Attraction {
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  image: string;
}

@Component({
  selector: 'app-attractions',
  templateUrl: './attractions.component.html',
  styleUrls: ['./attractions.component.css']
})
export class AttractionsComponent {
  attractions: Attraction[] = [
    {
      name: 'Guided Swamp Safari Tour',
      description: 'Board our secure walkway and explore the mangrove-lined swamp with an experienced guide who shares stories about local wildlife and swamp folklore.',
      duration: '45–60 minutes',
      difficulty: 'Easy',
      image: 'assets/images/guided-tour.jpg'
    },
    {
      name: 'Crocodile Feeding Show',
      description: 'Observe Jamaican crocodiles from a safe platform as our handlers demonstrate feeding techniques and talk about conservation efforts.',
      duration: '30 minutes',
      difficulty: 'Easy (viewing only)',
      image: 'assets/images/croc-feeding.jpg'
    },
    {
      name: 'Bird Watching Deck',
      description: 'Enjoy a peaceful lookout area where you can spot egrets, herons and other wetland birds in their natural habitat.',
      duration: 'Flexible',
      difficulty: 'Easy',
      image: 'assets/images/bird-deck.jpg'
    },
    {
      name: 'School & Group Tours',
      description: 'Customised educational tours aligned with geography, biology and environmental science curricula for local and international schools.',
      duration: '60–90 minutes',
      difficulty: 'Easy–Moderate',
      image: 'assets/images/school-group.jpg'
    },
    {
      name: 'Photography Spots',
      description: 'Capture scenic views of the swamp, rustic wooden bridges and the surrounding hills of Trelawny.',
      duration: 'Flexible',
      difficulty: 'Easy',
      image: 'assets/images/photo-spot.jpg'
    },
    {
      name: 'Chill-out Deck & Gift Area',
      description: 'Relax after your tour, grab a cold drink and browse local crafts and souvenirs to remember your visit.',
      duration: 'Flexible',
      difficulty: 'Easy',
      image: 'assets/images/chill-deck.jpg'
    }
  ];
}
